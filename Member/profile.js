
document.addEventListener("DOMContentLoaded", () => {
    initProfilePage();
});

function initProfilePage() {
    const profileForm = document.querySelector(".tf-profile-editor")?.closest("form");
    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const roleInput = document.getElementById("roleInput");
    const locationInput = document.getElementById("locationInput");
    const bioInput = document.getElementById("bioInput");
    const editorDetails = document.querySelector("details.tf-profile-editor");

    if (!profileForm || !nameInput) return;

    profileForm.setAttribute("novalidate", "true");

    const summaryAvatar = document.querySelector(".tf-profile-avatar");
    const summaryName = document.querySelector(".tf-profile-name");
    const summaryRole = document.querySelector(".tf-profile-intro .tf-role");
    const summaryEmail = document.querySelector(".tf-profile-email");
    const summaryBio = document.querySelector(".tf-profile-bio");

    let bioCounter = document.getElementById("bioCharCount");
    if (!bioCounter && bioInput && bioInput.parentNode) {
        bioCounter = document.createElement("div");
        bioCounter.className = "form-text text-end small text-muted mt-1";
        bioCounter.id = "bioCharCount";
        bioInput.parentNode.appendChild(bioCounter);
        bioCounter.textContent = `${bioInput.value.length} / 300 characters`;
    }

    try {
        const saved = localStorage.getItem("tf_member_profile");
        if (saved) {
            const data = JSON.parse(saved);
            if (data.name) {
                nameInput.value = data.name;
                if (summaryName) summaryName.textContent = data.name;
                if (summaryAvatar) summaryAvatar.textContent = data.name.charAt(0).toUpperCase();
            }
            if (data.email) {
                emailInput.value = data.email;
                if (summaryEmail) summaryEmail.textContent = data.email;
            }
            if (data.role && roleInput) {
                roleInput.value = data.role;
                if (summaryRole) summaryRole.textContent = data.role;
            }
            if (data.location && locationInput) {
                locationInput.value = data.location;
            }
            if (data.bio && bioInput) {
                bioInput.value = data.bio;
                if (summaryBio) summaryBio.textContent = data.bio;
                if (bioCounter) bioCounter.textContent = `${data.bio.length} / 300 characters`;
            }
        }
    } catch (e) { }

    try {
        const skills = JSON.parse(localStorage.getItem("tf_member_skills") || "{}");
        Object.keys(skills).forEach(key => {
            const select = document.querySelector(`select[name="${key}"]`);
            if (select) select.value = skills[key];
        });
    } catch (e) { }

    document.querySelectorAll(".tf-skill-row select").forEach(sel => {
        sel.addEventListener("change", () => {
            try {
                const skills = JSON.parse(localStorage.getItem("tf_member_skills") || "{}");
                skills[sel.name] = sel.value;
                localStorage.setItem("tf_member_skills", JSON.stringify(skills));
                showMemberToast("Skill Level Updated", `Saved proficiency for ${sel.getAttribute("aria-label") || sel.name} as ${sel.value}.`, "success", 2000);
            } catch (e) { }
        });
    });

    nameInput.addEventListener("input", () => {
        nameInput.value = nameInput.value.replace(/[^a-zA-Z\s'-]/g, "");
        const val = nameInput.value.trim();
        if (val.length >= 2) markFieldValid(nameInput);
        else if (val.length > 0) clearFieldStatus(nameInput);

        if (summaryAvatar && val.length > 0) summaryAvatar.textContent = val.charAt(0).toUpperCase();
    });

    emailInput.addEventListener("input", () => {
        emailInput.value = emailInput.value.toLowerCase();
        const val = emailInput.value.trim();
        if (isValidEmail(val)) markFieldValid(emailInput);
        else if (val.length > 0) clearFieldStatus(emailInput);
    });

    if (bioInput) {
        bioInput.addEventListener("input", () => {
            const len = bioInput.value.length;
            if (bioCounter) {
                bioCounter.textContent = `${len} / 300 characters`;
                if (len > 300) {
                    bioCounter.classList.add("text-danger");
                    bioCounter.classList.remove("text-muted");
                } else {
                    bioCounter.classList.remove("text-danger");
                    bioCounter.classList.add("text-muted");
                }
            }
            if (bioInput.value.trim().length >= 10) markFieldValid(bioInput);
            else clearFieldStatus(bioInput);
        });
    }

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;
        let firstInvalid = null;

        const nameVal = nameInput.value.trim();
        if (nameVal === "") {
            markFieldInvalid(nameInput, "Full name cannot be empty.");
            isValid = false;
            if (!firstInvalid) firstInvalid = nameInput;
        } else if (nameVal.length < 2) {
            markFieldInvalid(nameInput, "Full name must be at least 2 characters.");
            isValid = false;
            if (!firstInvalid) firstInvalid = nameInput;
        } else {
            markFieldValid(nameInput);
        }

        const emailVal = emailInput.value.trim();
        if (emailVal === "") {
            markFieldInvalid(emailInput, "Email address is required.");
            isValid = false;
            if (!firstInvalid) firstInvalid = emailInput;
        } else if (!isValidEmail(emailVal)) {
            markFieldInvalid(emailInput, "Please enter a valid work email.");
            isValid = false;
            if (!firstInvalid) firstInvalid = emailInput;
        } else {
            markFieldValid(emailInput);
        }

        const bioVal = bioInput ? bioInput.value.trim() : "";
        if (bioVal.length > 0 && bioVal.length < 10) {
            markFieldInvalid(bioInput, "Bio should be at least 10 characters long.");
            isValid = false;
            if (!firstInvalid) firstInvalid = bioInput;
        } else if (bioVal.length > 300) {
            markFieldInvalid(bioInput, "Bio cannot exceed 300 characters.");
            isValid = false;
            if (!firstInvalid) firstInvalid = bioInput;
        } else if (bioInput) {
            markFieldValid(bioInput);
        }

        if (!isValid) {
            if (firstInvalid) firstInvalid.focus();
            showMemberToast("Validation Error", "Please review the highlighted fields in your profile.", "error");
            return;
        }

        if (summaryName) summaryName.textContent = nameVal;
        if (summaryAvatar) summaryAvatar.textContent = nameVal.charAt(0).toUpperCase();
        if (summaryEmail) summaryEmail.textContent = emailVal;
        if (summaryRole && roleInput) summaryRole.textContent = roleInput.value;
        if (summaryBio && bioVal) summaryBio.textContent = bioVal;

        try {
            const profileData = {
                name: nameVal,
                email: emailVal,
                role: roleInput ? roleInput.value : "Member",
                location: locationInput ? locationInput.value.trim() : "",
                bio: bioVal
            };
            localStorage.setItem("tf_member_profile", JSON.stringify(profileData));
        } catch (e) { }

        if (editorDetails) {
            editorDetails.removeAttribute("open");
        }

        [nameInput, emailInput, bioInput].forEach(clearFieldStatus);
        initMemberSession();
        showMemberToast("Profile Saved", "Your profile details have been saved and synced across your workspace!", "success");
    });
}

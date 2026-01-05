export const proOnboardingSchema = {
    type: "object",
    properties: {
        // Profile Tab
        fullName: { type: "string", minLength: 2, errorMessage: "Full Name must be at least 2 characters." },
        businessName: { type: "string", minLength: 2, errorMessage: "Business Name must be at least 2 characters." },
        businessAddress: { type: "string", minLength: 5, errorMessage: "Please select a valid Business Address." },
        email: { type: "string", format: "email", errorMessage: "Please enter a valid Email Address." },

        // Skills Tab
        skills: {
            type: "array",
            minItems: 1,
            errorMessage: "Please select at least one skill."
        },
        serviceRadius: { type: "number", minimum: 5, maximum: 100 },

        // Resources & Verification Tab
        hasVehicle: { type: "boolean" },
        preferredRate: { type: ["number", "string"] }, // allow empty string input before conversion
        tools: { type: "array" },

        // Documents (Required)
        licenseNumber: { type: "string", minLength: 5, errorMessage: "Enter a valid Driver's License Number." },
        licenseFrontKey: { type: "string", minLength: 1, errorMessage: "Driver's License (Front) is required." },
        licenseBackKey: { type: "string", minLength: 1, errorMessage: "Driver's License (Back) is required." },
        // Optional
        insuranceKey: { type: ["string", "null"] },

        // Agreements
        agreedToTerms: {
            type: "boolean",
            const: true,
            errorMessage: "You must agree to the Terms & Conditions."
        }
    },
    required: [
        "fullName",
        "businessName",
        "businessAddress",
        "email",
        "skills",
        "licenseNumber",
        "licenseFrontKey",
        "licenseBackKey",
        "agreedToTerms"
    ],
    additionalProperties: true
};

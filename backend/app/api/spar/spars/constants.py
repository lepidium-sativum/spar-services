class ErrorCode:
    SPAR_NOT_FOUND = "Spar not found with the given Id."
    SPAR_USER_OWNED_NOT_FOUND = "Spar either doesn't exist or you don't own it"
    SPAR_ALREADY_EXISTS = "Spar already exists."
    SPAR_INVALID_STATE = "SPAR is not started or already completed"
    SPAR_SUCCEEDED = "SPAR ended successfully"
    SPAR_FAILED = "User failed the SPAR"
    SPAR_NOT_FINISHED = "SPAR is not finished yet"
    SPAR_FILES_NOT_UPLOADED = "One or more media files not found."
    SPAR_FILES_NOT_AVAILABLE = "Files to be processed aren't available"

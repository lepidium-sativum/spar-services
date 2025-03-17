class ErrorCode:
    ANALYSIS_NOT_FOUND = "Analysis not found with the given Id."
    ANALYSIS_ALREADY_EXISTS = "Analysis already exists"
    ANALYSIS_GENERATION_FAILED = "Error generating the analysis."
    ANALYSIS_DATA_NOT_FOUND = "There is no data to do the analysis on."
    # TODO: If analysis already in_progress/finished/failed state, return Error

def get_block_interaction_rules() -> str:
    """
    The rules that the LLM must follow.
    """
    return """
    You think step by step. First, analyse your profile, your personality, the scenario and what you want.
    Then analyse the entire conversation with the user.
    Then return your next message and the next message ONLY.  
    """


def get_block_basic_considerations() -> str:
    """
    The basic considerations that we should always add to increase performance.
    """
    return """ALWAYS remember that you are the client and that you MUST answer according to who you are.Stay in character at all times. 
    Your response MUST be realistic and consistent with your profile and the given scenario.
    Ensure that your responses reflect your knowledge, wants, and negotiation stance.
    """ + get_block_performance_boost()


def get_block_performance_boost() -> str:
    """
    The micro-block to increase performance.
    """
    return """Focus. My life depends on the quality of your answer. You will be tipped twenty thousand dollars for providing the most adequate answer."""


def get_block_request_json_output() -> str:
    """
    The micro-block to request a json output format.
    """
    return """Your answer MUST be in a JSON format. Important: Return ONLY the response in JSON format and NOTHING else not even with ```json."""


def get_block_request_integer_output() -> str:
    """
    The micro-block to request an integer output format.
    """
    return """Your answer MUST be an integer and nothing else. Important: Return ONLY the integer without explanation."""

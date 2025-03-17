def clean_bullet_points(text: str) -> str:
    return text.replace("\u2022", "-").replace("•", "-")

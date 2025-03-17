from enum import Enum


class Environment(str, Enum):
    LOCAL = "LOCAL"
    STAGING = "STAGING"
    TESTING = "TESTING"
    PROD = "PROD"

    @property
    def is_local(self):
        return self == self.LOCAL

    @property
    def is_debug(self):
        return self in (self.LOCAL, self.STAGING, self.TESTING)

    @property
    def is_testing(self):
        return self == self.TESTING

    @property
    def is_deployed(self) -> bool:
        return self in (self.STAGING, self.PROD)

    @property
    def is_staging(self):
        return self == self.STAGING

    @property
    def is_prod(self) -> bool:
        return self == self.PROD

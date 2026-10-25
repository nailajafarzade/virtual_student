from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """
    Spring<->Python sərhədini keçən bütün modellər üçün baza.
    Jackson camelCase istifadə edir; bu model Python-da snake_case saxlayır,
    şəbəkədə isə camelCase ilə danışır.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
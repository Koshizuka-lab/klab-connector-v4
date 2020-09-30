# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from swagger_server.models.base_model_ import Model
from swagger_server import util
from swagger_server.models.attribute import Attribute


class Entity(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """

    def __init__(self, type: str=None, id: str=None, attribute_name: Attribute=None):  # noqa: E501
        """Entity - a model defined in Swagger

        :param type: The type of this Entity.  # noqa: E501
        :type type: str
        :param id: The id of this Entity.  # noqa: E501
        :type id: str
        :param attribute_name: The attribute_name of this Entity.  # noqa: E501
        :type attribute_name: Attribute
        """
        self.swagger_types = {
            'type': str,
            'id': str,
            'attribute_name': Attribute
        }

        self.attribute_map = {
            'type': 'type',
            'id': 'id',
            'attribute_name': 'AttributeName'
        }

        self._type = type
        self._id = id
        self._attribute_name = attribute_name

    @classmethod
    def from_dict(cls, dikt) -> 'Entity':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The Entity of this Entity.  # noqa: E501
        :rtype: Entity
        """
        return util.deserialize_model(dikt, cls)

    @property
    def type(self) -> str:
        """Gets the type of this Entity.


        :return: The type of this Entity.
        :rtype: str
        """
        return self._type

    @type.setter
    def type(self, type: str):
        """Sets the type of this Entity.


        :param type: The type of this Entity.
        :type type: str
        """
        if type is None:
            raise ValueError("Invalid value for `type`, must not be `None`")  # noqa: E501

        self._type = type

    @property
    def id(self) -> str:
        """Gets the id of this Entity.


        :return: The id of this Entity.
        :rtype: str
        """
        return self._id

    @id.setter
    def id(self, id: str):
        """Sets the id of this Entity.


        :param id: The id of this Entity.
        :type id: str
        """
        if id is None:
            raise ValueError("Invalid value for `id`, must not be `None`")  # noqa: E501

        self._id = id

    @property
    def attribute_name(self) -> Attribute:
        """Gets the attribute_name of this Entity.


        :return: The attribute_name of this Entity.
        :rtype: Attribute
        """
        return self._attribute_name

    @attribute_name.setter
    def attribute_name(self, attribute_name: Attribute):
        """Sets the attribute_name of this Entity.


        :param attribute_name: The attribute_name of this Entity.
        :type attribute_name: Attribute
        """

        self._attribute_name = attribute_name

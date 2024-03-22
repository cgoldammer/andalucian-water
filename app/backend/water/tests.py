from django.test import TestCase, Client
from django.urls import reverse
from water.models import Reservoir, ReservoirState
from water.utils import helpers
from water.fixtures import setup_script
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from water import app_state
from water.utils import data
import logging

log = logging.getLogger(__name__)

username = "test"
password = "test"
user_data = {"username": username, "password": password}
wrong_password = "wrong_password"
wrong_username = "wrong_username"
state = app_state.AppState()


class AppTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(**user_data)

    def set_token(self):
        response = self.client.post("/api/api-token-auth/", user_data, format="json")

        # Assert that the token is valid
        token = response.json()["token"]
        self.assertTrue(token)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)


class UserTestCase(AppTest):
    def setUp(self):
        # Run the setUp from the super class
        super().setUp()

    def testLogin(self):
        """
        Test that the user can login
        """
        user = self.user
        response = self.client.post("/api/api-token-auth/", user_data, format="json")
        self.assertEqual(
            response.status_code, 200
        )  # Replace 200 with the expected status code
        token = response.json()["token"]
        self.assertTrue(token)

    def testLoginFail(self):
        """
        Test that the user cannot login with a wrong password
        """
        user = self.user
        response = self.client.post(
            "/api/api-token-auth/",
            {"username": user.username, "password": "wrong_password"},
            format="json",
        )
        self.assertEqual(
            response.status_code, 400
        )  # Replace 200 with the expected status code
        self.assertTrue("token" not in response.json())

    def testLoginFail2(self):
        """
        Test that the user cannot login with a wrong username
        """
        user = self.user
        response = self.client.post(
            "/api/api-token-auth/",
            {"username": wrong_username, "password": password},
            format="json",
        )
        self.assertEqual(
            response.status_code, 400
        )  # Replace 200 with the expected status code
        self.assertTrue("token" not in response.json())

    def testTokenEndpointWithToken(self):

        # Log in and obtain the token from the api-token-auth
        # endpoint
        response = self.client.post("/api/api-token-auth/", user_data, format="json")

        # Assert that the token is valid
        token = response.json()["token"]
        self.assertTrue(token)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)

        response = self.client.get("/api/login_test", format="json")
        self.assertTrue("user" in response.json())


class ReservoirTestCase(AppTest):
    def setUp(self):
        super().setUp()
        setup_script.fill_simple()
        state.set_mock_mode(True)

    def testGetReservoirs(self):
        reservoirs = data.get_reservoirs()

        reservoirs_raw = Reservoir.objects.all()
        self.assertTrue(len(reservoirs) == len(reservoirs_raw))

from django.test import TestCase, Client
from django.urls import reverse
from water import models as m
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
        response = self.client.post("/api/api-token-auth", user_data, format="json")

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
        response = self.client.post("/api/api-token-auth", user_data, format="json")
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
            "/api/api-token-auth",
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
            "/api/api-token-auth",
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
        response = self.client.post("/api/api-token-auth", user_data, format="json")

        # Assert that the token is valid
        token = response.json()["token"]
        self.assertTrue(token)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        response = self.client.get("/api/login_test", format="json")
        self.assertTrue("user" in response.json())


class DataTestCase(AppTest):
    def setUp(self):
        super().setUp()
        state.set_mock_mode(True)

    def testBasic(self):
        setup_script.fill_simple()
        reservoirs = m.Reservoir.objects.all()
        self.assertTrue(len(reservoirs) > 0)
        materialized = data.StatesMaterialized.objects.all()
        self.assertTrue(len(materialized) > 0)

    def testGetReservoirs(self):
        setup_script.fill_simple()
        reservoirs = data.get_reservoir_data()
        reservoirs_raw = m.Reservoir.objects.all()
        self.assertTrue(len(reservoirs) == len(reservoirs_raw))

    def testGetWide(self):
        num_reservoirs = 1
        date_start = "2023-09-01"
        date_end = "2024-01-01"
        setup_script.fill_simple(num_reservoirs, date_start, date_end)
        reservoir_uuids = [str(m.Reservoir.objects.all()[0].uuid)]

        arguments = {
            "num_obs": 1000,
            "start_date": date_start,
            "end_date": date_end,
            "filter_type": "year",
            "reservoir_uuids": reservoir_uuids,
        }
        states_year = data.get_wide_data(**arguments)
        message = f"Expected {num_reservoirs} reservoirs, got {len(states_year)}"
        assert len(states_year) == num_reservoirs, message

        arguments["filter_type"] = "day"
        states_day = data.get_wide_data(**arguments)
        message = f"Expected {num_reservoirs} reservoirs, got {len(states_day)}"
        assert len(states_day) >= num_reservoirs * 30, message


class ApiTestCase(AppTest):

    def setUp(self):
        super().setUp()
        state.set_mock_mode(True)

    def testGetWide(self):

        params = {
            "filter_type": "year",
            "start_date": "2023-09-01",
            "end_date": "2024-01-01",
        }

        setup_script.fill_simple(
            num_reservoirs=1,
            start_date=params["start_date"],
            end_date=params["end_date"],
        )

        params["reservoir_uuids"] = [str(m.Reservoir.objects.all()[0].uuid)]
        url = "/api/get_wide/"
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(len(data) > 0)

        first = data[0]
        self.assertTrue("date" in first)


class GeoTestCase(AppTest):
    def setUp(self):
        super().setUp()
        setup_script.fill_simple()
        setup_script.create_regions()

    def test_reservoir_geo(self):
        geos = m.ReservoirGeo.objects.all()
        gj = data.get_reservoirs_geojson()
        assert len(gj["features"]) == len(geos)

    def test_regions(self):
        geos = m.Region.objects.all()
        gj = data.get_regions_geojson(filter_to_reservoir=False)
        assert len(gj["features"]) == len(geos)

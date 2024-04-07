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


class ReservoirTestCase(AppTest):
    def setUp(self):
        super().setUp()

        state.set_mock_mode(True)

    def testGetReservoirs(self):
        setup_script.fill_simple()
        reservoirs = data.get_reservoir_data()

        reservoirs_raw = Reservoir.objects.all()
        self.assertTrue(len(reservoirs) == len(reservoirs_raw))

        # first_reservoir = reservoirs[0]
        # states_for_first_reservoir = ReservoirState.objects.filter(
        #     reservoir=first_reservoir
        # )
        # print("RESPOINSE")
        # print(reservoirs[0].uuid, reservoirs[0].num_states, reservoirs[0].volume_latest)
        # latest_state = states_for_first_reservoir.latest("date")
        # first_reservoir_in_response = [
        #     r for r in reservoirs if r.uuid == str(first_reservoir.uuid)
        # ][0]

        # self.assertTrue(
        #     first_reservoir_in_response.volume_latest == latest_state.volume
        # )

    def testGetReservoirStates(self):
        setup_script.fill_simple()
        reservoirs = Reservoir.objects.all()
        reservoir = reservoirs[0]

        start_date = "1970-01-01"
        end_date = "2999-01-01"

        num_obs = 10
        states = data.get_reservoir_states_data(
            num_obs, start_date, end_date, False, [str(reservoir.uuid)]
        )

        assert len(states) > 0

    def testGetWideYearly(self):
        num_reservoirs = 1
        date_start = "2023-09-01"
        date_end = "2024-01-01"
        setup_script.fill_simple(num_reservoirs, date_start, date_end)
        reservoir_uuids = [str(Reservoir.objects.all()[0].uuid)]

        arguments = {
            "num_obs": 1000,
            "start_date": date_start,
            "end_date": date_end,
            "is_first_of_year": True,
            "reservoir_uuids": reservoir_uuids,
        }
        states_year = data.get_wide_data(**arguments)
        assert len(states_year) == num_reservoirs

        arguments["is_first_of_year"] = False
        states_day = data.get_wide_data(**arguments)
        assert len(states_day) >= num_reservoirs * 30

    def testGetWideDaily(self):
        setup_script.fill_simple()
        reservoir_uuids = [str(Reservoir.objects.all()[0].uuid)]

        arguments = {
            "num_obs": 10,
            "start_date": "1970-01-01",
            "end_date": "2999-01-01",
            "is_first_of_year": False,
            "reservoir_uuids": reservoir_uuids,
        }
        states = data.get_wide_data(**arguments)

        # Ensure that both reservoirState and rainfall
        # are not null at least once in the states

        not_null_state = sum([st["reservoir_state"] is not None for st in states])
        not_null_rainfall = sum([st["rainfall"] is not None for st in states])
        assert not_null_state > 0
        assert not_null_rainfall > 0
        assert len(states) > 0

        first_res = states[0]
        assert first_res["reservoir"] is not None
        assert first_res["reservoir_state"] is not None
        assert first_res["rainfall"] is not None

    def testGetDailyView(self):
        setup_script.fill_simple()
        reservoirs = Reservoir.objects.all()
        reservoir = reservoirs[0]

        start_date = "1970-01-01"
        end_date = "2999-01-01"

        num_obs = 10
        url = f"/api/get_wide/?num_obs={num_obs}&start_date={start_date}&end_date={end_date}&reservoir_uuids={reservoir.uuid}"

        response = self.client.get(url)
        # Assert that response is ok
        self.assertEqual(response.status_code, 200)
        json_parsed = response.json()

        assert len(json_parsed) > 0

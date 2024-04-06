import { IntroView } from "./IntroView";
import { render, fireEvent, screen } from "@testing-library/react";
import React from "react";
import { texts } from "../texts";
import "@testing-library/jest-dom";

jest.mock("react-leaflet/ImageOverlay", () => ({
  ImageOverlay: jest.fn().mockImplementation(({ children }) => children),
}));

// Mock this out import { useNavigate } from "react-router-dom";
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const setup = () => {
  const { asFragment, getByRole } = render(<IntroView />);

  return {
    asFragment,
    getByRole,
  };
};

test("It should give the title", () => {
  const { getByRole } = setup();
  const projectTag = texts.projectTag;
  expect(getByRole("title")).toHaveTextContent(projectTag);
});

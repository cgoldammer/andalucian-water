import { IntroView } from "./IntroView";
import { render, fireEvent, screen } from "@testing-library/react";
import React from "react";
import { texts } from "../texts";
import "@testing-library/jest-dom";

const setup = () => {
  const { asFragment, getByText } = render(<IntroView />);

  return {
    asFragment,
    getByText,
  };
};

test("It should give the product description", () => {
  const { asFragment, getByText } = setup();
  const projectDescription = texts.projectDescription;
  expect(getByText(projectDescription)).toBeInTheDocument();
});

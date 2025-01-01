import React from "react";

import { urlRediamData, urlRepo } from "./constants";
import { CombineWithLink } from "./Components";

const addLinks = (texts) => {
  const about = texts.about;

  const linkRepoRendered = (
    <CombineWithLink
      text={about.linkRepo.text}
      linkName={about.linkRepo.linkName}
      url={urlRepo}
    />
  );
  const linkRawDataRendered = (
    <CombineWithLink
      text={about.linkRawData.text}
      linkName={about.linkRawData.linkName}
      url={urlRediamData}
    />
  );

  const aboutRendered = {
    linkRepoRendered,
    linkRawDataRendered,
  };

  return {
    ...texts,
    aboutRendered,
  };
};

export const prepareTexts = (texts) => {
  return addLinks(texts);
};

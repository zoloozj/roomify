import puter from "@heyputer/puter.js";
import {
  getOrCreateHostingConfig,
  uploadImageToHosting,
} from "./puter.hosting";
import { isHostedUrl } from "./utils";

export const SignIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCuttentUser = async () => {
  try {
    return await puter.auth.getUser();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createProject = async ({
  item,
}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
  const projectId = item.id;

  const hosting = await getOrCreateHostingConfig();

  const hostedSource = projectId
    ? await uploadImageToHosting({
        hosting,
        url: item.sourceImage,
        projectId,
        label: "source",
      })
    : null;

  const hostedRender =
    projectId && item.renderedImage
      ? await uploadImageToHosting({
          hosting,
          url: item.renderedImage,
          projectId,
          label: "rendered",
        })
      : null;

  const resolverSource =
    hostedSource?.url ||
    (isHostedUrl(item.sourceImage) ? item.sourceImage : "");

  if (!resolverSource) {
    console.warn("No valid source image URL found for project:", projectId);
    return null;
  }
  let resolvedRender = undefined;
  if (hostedRender?.url) resolvedRender = hostedRender.url;
  else if (item.renderedImage && isHostedUrl(item.renderedImage))
    resolvedRender = item.renderedImage;

  const {
    sourcePath: _sourcePath,
    renderedPath: _renderedPath,
    publicPath: _publicPath,
    ...rest
  } = item;

  const payload = {
    ...rest,
    sourceImage: resolverSource,
    renderedImage: resolvedRender,
  };

  try {
    return payload;
  } catch (error) {
    console.warn("Failed to create project with hosted images:", error);
    return null;
  }
};

import { Directus } from "@directus/sdk";
export const getDirectusClient = async () => {
  const directus = new Directus('https://directus.frontend.mu');
  return directus;
};
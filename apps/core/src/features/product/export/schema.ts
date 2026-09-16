import { z } from "zod";

import { sceneFormat } from "@tulocal/database/schema/scenes";

export const sceneFormatSchema = z.enum(sceneFormat.enumValues);

export const exportSourceSchema = z.enum(["photo", "generated"]);

export const carouselSlideSchema = z.enum(["1", "2", "3"]);

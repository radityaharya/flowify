/* eslint-disable no-unused-vars */
import React from "react";
import Image from "next/image";
import pb, { ResizeType, BuildOptions } from "@bitpatty/imgproxy-url-builder";

import { env } from "~/env";
interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}

const Img: React.FC<Props> = (props) => {
  if (!props.src || props.src === "" || props.src === undefined) {
    return <></>;
  }

  const buildOptions: BuildOptions = {
    plain: false,
    path: props.src,
    baseUrl: process.env.IMGPROXY_URL,
    signature: {
      key: env.IMGPROXY_KEY,
      salt: env.IMGPROXY_SALT,
    },
  };

  const resizeOptions = {
    type: ResizeType.FIT,
    width: props.width ? props.width * 2 : 1000,
    height: props.height ? props.height * 2 : 600,
  };

  const srcUrl = pb()
    // .resize(resizeOptions)
    .format("webp")
    // .fallbackImageUrl(props.src)
    // .keepCopyright()
    .quality(80)
    .build(buildOptions);

  return (
    <Image
      src={srcUrl}
      alt={props.alt}
      className={props.className}
      style={props.style}
      width={props.width}
      height={props.height}
      loading={props.loading}
      unoptimized={true}
    />
  );
};

interface UrlBuilderOptions {
  src: string;
  width?: number;
  height?: number;
}

function buildImageUrl({ src, width, height }: UrlBuilderOptions): string {
  if (!src || src === "" || src === undefined) {
    return "";
  }

  const buildOptions: BuildOptions = {
    plain: false,
    path: src,
    baseUrl: process.env.IMGPROXY_URL,
    signature: {
      key: env.IMGPROXY_KEY,
      salt: env.IMGPROXY_SALT,
    },
  };

  let resizeOptions = {};
  if (width && height) {
    resizeOptions = {
      type: ResizeType.FIT,
      width: width ? width * 2 : 1000,
      height: height ? height * 2 : 600,
    };
  }

  const srcUrl = pb()
    // .resize(resizeOptions)
    .format("webp")
    // .fallbackImageUrl(src)
    // .keepCopyright()
    .quality(80)
    .build(buildOptions);

  return srcUrl;
}

export { Img, buildImageUrl };

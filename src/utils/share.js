export const shareToFacebook = (href, text) => {
  window.FB.ui({
    method: "share",
    mobile_iframe: true,
    href,
    quote: text,
  });
};

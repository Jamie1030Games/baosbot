const colorMap = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  gray: "#808080",
  silver: "#C0C0C0",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00FF00",
  aqua: "#00FFFF",
  teal: "#008080",
  navy: "#000080",
  purple: "#800080",
  fuchsia: "#FF00FF",
  orange: "#FFA500",
  pink: "#FFC0CB",
  brown: "#A52A2A",
  beige: "#F5F5DC",
  ivory: "#FFFFF0",
  lavender: "#E6E6FA",
  indigo: "#4B0082",
  gold: "#FFD700",
  coral: "#FF7F50",
};
function getHexCode(colorName) {
  if (typeof colorName !== "string") {
    return;
  }

  const color = colorMap[colorName.toLowerCase()];
  if (color) {
    return color;
  } else {
    throw new Error("Color not found");
  }
}

module.exports = getHexCode;

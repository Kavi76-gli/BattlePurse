function buildImageUrl(req, folder, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
}

module.exports = buildImageUrl;

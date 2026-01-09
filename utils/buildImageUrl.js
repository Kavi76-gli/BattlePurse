function buildImageUrl(req, folder, filename) {
  if (!filename) return null;
 return `https://${req.get("host")}/uploads/${folder}/${filename}`;

}

module.exports = buildImageUrl;

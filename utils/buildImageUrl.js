function buildImageUrl(folder, filename) {
  if (!filename) return null;
  return `https://battlepurse-2ch0.onrender.com/uploads/${folder}/${filename}`;
}

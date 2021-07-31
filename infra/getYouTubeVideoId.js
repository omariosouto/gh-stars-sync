module.exports = {
  getYouTubeVideoId: function(url) {
    const id = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/)[7];
    return id;
  }
}
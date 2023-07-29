//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(spotifyApi, playlistId, playlistName) {
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 0,
    limit: 100,
    fields: "items",
  });

  // console.log('The playlist contains these tracks', data.body);
  // console.log('The playlist contains these tracks: ', data.body.items[0].track);
  // console.log("'" + playlistName + "'" + ' contains these tracks:');
  let tracks = [];

  for (let track_obj of data.body.items) {
    const track = track_obj.track;
    tracks.push(track);
  }

  return tracks;
}

module.exports = getPlaylistTracks;

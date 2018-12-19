export default function isTweet(obj) {
  // returns false if the object does not have all properties required by
  // react-tweet with non-null or undefined values
  return !!(
    obj.id_str &&
    obj.user &&
    obj.user.name &&
    obj.user.screen_name &&
    obj.user.profile_image_url &&
    obj.text &&
    obj.created_at &&
    obj.favorite_count &&
    obj.entities &&
    obj.entities.media &&
    obj.entities.urls &&
    obj.entities.user_mentions &&
    obj.entities.hashtags &&
    obj.entities.symbols
  );
}

export function isTweetWithCoords(obj) {
  // verifies that object is a tweet and has lat/long

  if (!isTweet(obj)) return false;
  if (!!typeof obj.coordinates) return false;
  if (!!typeof obj.coordinates.Latitude) return false;
  if (!!typeof obj.coordinates.Longitude) return false;
  return true;
}

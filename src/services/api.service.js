import steem from './steem.service';

function requestAsync( opts, raw ) {
  if ( opts.body && !raw ) {
    opts.body = JSON.stringify( opts.body );
  }
  if ( !opts.headers ) {
    opts.headers = {};
  }
  if ( !raw ) {
    opts.headers.accept = 'application/json';
    opts.headers['content-type'] = 'application/json';
  }
  return fetch( opts.url, opts )
    .then( ( response ) => {
      if ( !response.ok ) {
        throw new Error( response.statusText );
      } else {
        return response.json();
      }
    } );
}

export function getScotTokenPayout( author, permlink ) {
  const opts = {
    method: 'GET',
    json: true,
    headers: {},
    url: `https://scot-api.steem-engine.com/@${author}/${permlink}`,
  };

  return requestAsync( opts );
}

export function apiURL() {
  return `${process.env.VUE_APP_API_HOST}/v1/forum/${global.forumname}`;
}

export function uploadImage( image ) {
  const formdata = new FormData();
  formdata.append( 'image', image );
  const opts = {
    method: 'POST',
    body: formdata,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: `${process.env.VUE_APP_API_HOST}/v1/image-upload`,
  };

  return requestAsync( opts, true );
}

export function unpin( topic ) {
  const opts = {
    method: 'DELETE',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + `/topics/${topic.steem.author}/${topic.steem.permlink}/pin`,
  };

  return requestAsync( opts );
}

export function pin( topic ) {
  const opts = {
    method: 'PUT',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + `/topics/${topic.steem.author}/${topic.steem.permlink}/pin`,
  };

  return requestAsync( opts );
}

export function hide( topic ) {
  const opts = {
    method: 'DELETE',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + `/topics/${topic.steem.author}/${topic.steem.permlink}/hide`,
  };

  return requestAsync( opts );
}

export function vote( author, permlink, voter, weight ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + `/topics/${author}/${permlink}/vote`,
    body: {
      voter,
      weight,
    },
  };

  return requestAsync( opts );
}

export function getDomainForum( domain ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: `${process.env.VUE_APP_API_HOST}/v1/domainforum/`,
    body: {
      domain,
    },
  };
  return requestAsync( opts );
}

export function listRoles() {
  const opts = {
    method: 'GET',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + '/',
  };

  return requestAsync( opts );
}

// function deleteTopic (topic) {
//   var opts = {
//     method: 'DELETE',
//     json: true,
//     headers: { authorization: steem.token },
//     url: apiURL() + '/api//topics',
//     body: topic
//   }

//   return requestAsync(opts)
// }

export function listCategories() {
  return requestAsync( {
    method: 'GET',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + '/categories',
  } );
}

export function createForum( forumName, admin ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: `${process.env.VUE_APP_API_HOST}/v1/forum/`,
    body: {
      name: forumName,
      admin,
    },
  };

  return requestAsync( opts );
}

export function addCategory( category ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + '/categories/',
    body: {
      ...category,
    },
  };

  return requestAsync( opts );
}

export function editCategory( category ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: `${apiURL()}/${category.slug}/edit`,
    body: {
      ...category,
    },
  };

  return requestAsync( opts );
}

export function removeCategory( categoryName ) {
  const opts = {
    method: 'DELETE',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: apiURL() + '/categories/' + categoryName,
  };

  return requestAsync( opts );
}

export function setCategoryOrdering( categoryOrdering ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: `${apiURL()}/categoryOrdering`,
    body: {
      categoryOrdering: JSON.stringify( categoryOrdering ),
    },
  };

  return requestAsync( opts );
}

export function listValidTopics( category ) {
  let url = apiURL() + '/topics';

  if ( category ) {
    url = apiURL() + `/${category}/topics`;
  }

  const opts = {
    method: 'GET',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url,
  };

  return requestAsync( opts );
}

export function listValidReplies( post ) {
  const { author, permlink } = post;
  const url = apiURL() + `/replies?author=${author}&permlink=${permlink}`;

  const opts = {
    method: 'GET',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url,
  };

  return requestAsync( opts );
}

export function publishTopic( category, author, title, body ) {
  return requestAsync( {
    method: 'POST',
    url: `${apiURL()}/${category}/topics`,
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    body: {
      author,
      title,
      body,
    },
  } );
}

export function publishReply( parentComment, message ) {
  const { author, content } = message;

  const opts = {
    method: 'POST',
    url: apiURL() + `/topics/${parentComment.steem.author}/${parentComment.steem.permlink}/reply`,
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    body: {
      author,
      body: content,
    },
  };

  return requestAsync( opts );
}

export function publishEdit( post, message ) {
  const { content, title } = message;

  const opts = {
    method: 'POST',
    url: apiURL() + `/topics/${post.steem.author}/${post.steem.permlink}/edit`,
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    body: {
      title,
      body: content,
    },
  };

  return requestAsync( opts );
}

export function getValidTopic( author, permlink ) {
  const opts = {
    method: 'GET',
    url: apiURL() + `/topics/${author}/${permlink}`,
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
  };

  return requestAsync( opts )
    .catch( ( err ) => {
      if ( err.statusCode === 404 ) {
        return null;
      }

      this.$ga.exception( err );

      throw err;
    } );
}

export function getUsers( ids ) {
  const opts = {
    method: 'POST',
    json: true,
    url: `${process.env.VUE_APP_API_HOST}/v1/users`,
    body: {
      ids,
    },
  };
  return requestAsync( opts );
}

export function modifyForumPermission( action, type, username ) {
  const opts = {
    method: 'POST',
    json: true,
    headers: steem.token ? { 'Authorization': 'Bearer ' + steem.token } : {},
    url: `${apiURL()}/${action}/${type}`,
    body: {
      username,
    },
  };
  return requestAsync( opts );
}

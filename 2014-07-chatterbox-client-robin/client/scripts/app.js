var app = {
  init: function() {
    app.server = 'http://127.0.0.1:3000/classes/messages';
    app.friends = {};
    app.rooms = {};

    $('#send').on('submit', app.handleSubmit);
    $('#roomSubmit').on('submit', app.changeRoom);
    $('#chats').on('click', '.username', app.addFriend);

    app.getURLParams();
    app.fetch(app.currentRoom);
    setInterval(app.fetch.bind(this, app.currentRoom), 1000);
  },

  getURLParams: function() {
    var url = window.location.search;
    var url_arr = url.substr(1).split("&");
    var attr = {};

    for (var k = 0; k < url_arr.length; k++) {
      var holder = url_arr[k].split("=");
      attr[holder[0]] = holder[1];
    }

    app.currentUser = attr.username;
    if (attr.room !== undefined) {
      app.currentRoom = attr.room;
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var memo = $('input.message').val();

    var message = {
      username: app.currentUser,
      text: memo,
      roomname: app.currentRoom
    };

    app.send(message);
    $('input.message').val('');
  },

  changeRoom: function(e) {
    e.preventDefault();
    room = $('input.room').val();
    window.location.search = "?username=" + app.currentUser;
    if(room.length > 0) {
      window.location.search += "&room=" + room;
    }
  },

  addFriend: function() {
    friend = $(this).text();
    friend = friend.substring(0, friend.length-2);
    app.friends[friend] = true;
    app.fetch(app.currentRoom);
  },

  addMessage: function(message, room) {
    if(message.roomname === room || room === undefined) {
      $node = $('<div class="chat"></div>');
      $username = $('<span class="username"></span>');
      if (app.friends[message.username]) {
        $node.addClass('friend');
      }
      $username.text(message.username + ': ');
      $node.text(message.text);
      $node.prepend($username);
      $('#chats').prepend($node);
    }
  },

  addRoom: function(room) {
    $node = $("<div></div>");
    $node.text(room);
    $('#roomSelect').append($node);
  },

  send: function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        app.addMessage(message);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },

  fetch: function(room) {
    $.ajax({
      url: app.server,
      type: 'GET',
      // data: {order: '-createdAt'},
      success: function (data) {
        data = JSON.parse(data);
        console.log('chatterbox: Message received');
        app.processData(data.results, room);
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive messages');
      }
    });
  },

  processData: function(results, room) {
    app.clearMessages();
    app.processMessages(results, room);
    app.processRooms();
  },

  clearMessages: function() {
    $('#chats').empty();
  },

  processMessages: function(results, room) {
    for(var i = 0; i < results.length; i++) {
      var element = results[results.length - i - 1];
      app.addMessage(element, room);
      app.rooms[element.roomname] = true;
    }
  },

  processRooms: function() {
    $('#roomSelect').empty();
    for (var key in app.rooms) {
      app.addRoom(key);
    }
  }
};

$(document).ready(function() {
  app.init();
});

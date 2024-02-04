const moment = require('moment')

module.exports = {
  formatDate: function (date, format) {
    return moment(date).utc().format(format)
  },

  truncate: function (str, len) {
    if (str.length > len && str.length > 0) {
      let new_str = str + ' ';
      new_str = new_str.substr(0, len); // Corrected line
      new_str = new_str.substr(0, new_str.lastIndexOf(' '));
      new_str = new_str.length > 0 ? new_str : str.substr(0, len);
      return new_str + '...';
    }
    return str;
  },

  stripTags: function (input) {
    if (input) {
      return input.replace(/<(?:.|\n)*?>/gm, '').replace(/&nbsp;|\s+/g, ' ').replace(/&amp;/g, '&');
    }
    return '';
  },

  editIcon: function (storyUser, loggedUser, storyId, floating = true) {
    if (storyUser._id.toString() == loggedUser._id.toString()) {
      if (floating) {
        return `<a href="/story/edit/${storyId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`
      } else {
        return `<a href="/story/edit/${storyId}"><i class="fas fa-edit"></i></a>`
      }
    } else {
      return ''
    }
  },
  editIcon1: function (newsUser, loggedUser, newsId, floating = true) {
    if (!newsUser || !loggedUser) {
      return ''; // Return an empty string or some default value
    }

    if (newsUser._id.toString() == loggedUser._id.toString()) {
      if (floating) {
        return `<a href="/news/edit/${newsId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
      } else {
        return `<a href="/news/edit/${newsId}"><i class="fas fa-edit"></i></a>`;
      }
    } else {
      return '';
    }
  },

  select: function (selected, options) {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp('>' + selected + '</option>'),
        ' selected="selected"$&'
      )
  },
}

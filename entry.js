if (typeof ext == 'undefined') var ext = {};

ext.HototShortUrl = {

id: 'org.hotot.shorturl',

name: 'Hotot Short URL',

description: 'To configure short URL services.',

version: '1.0',

author: 'Xoan Sampaiño',

url: 'http://github.com/xoan/org.hotot.shorturl',

icon: 'icon.png',

services: {
    'isgd': {
        name: 'is.gd',
        url: 'http://is.gd/api.php',
        params: {
            long_url: 'longurl'
        }
    },
    'tinyurl': {
        name: 'TinyURL',
        url: 'http://tinyurl.com/api-create.php',
        params: {
            long_url: 'url'
        }
    },
    'bitly': {
        name: 'Bit.ly',
        url: 'http://api.bit.ly/v3/shorten',
        params: {
            login: 'login',
            api_key: 'apiKey',
            extra: {
                format: 'txt'
            },
            long_url: 'longUrl'
        }
    },
    'kcy': {
        name: 'Karmacracy',
        url: 'http://kcy.me/api/',
        params: {
            login: 'u',
            api_key: 'key',
            long_url: 'url'
        }
    },
    'other': {
        name: 'Other',
        params: {}
    }
},

user_login: undefined,

user_api_key: undefined,

service_url: undefined,

set_service_url:
function set_service_url(service_index) {
    ext.HototShortUrl.prefs.get(service_index + '_login', function(key, val) {
        ext.HototShortUrl.user_login = val;
    });
    ext.HototShortUrl.prefs.get(service_index + '_api_key', function(key, val) {
        ext.HototShortUrl.user_api_key = val;
    });
    // Workaround to fix db transaction queue...
    // Is not possible to concatenate db values, so make a new transaction
    // permits to asign above values before using them
    // var service = ext.HototShortUrl.services[service_index];
    ext.HototShortUrl.prefs.get('service', function(key, val) {
        var service = ext.HototShortUrl.services[val];
        if (service.url) {
            ext.HototShortUrl.service_url = service.url + '?';
            if (service.params.login) {
                ext.HototShortUrl.service_url+= service.params.login + '=';
                ext.HototShortUrl.service_url+= ext.HototShortUrl.user_login + '&';
            }
            if (service.params.api_key) {
                ext.HototShortUrl.service_url+= service.params.api_key + '=';
                ext.HototShortUrl.service_url+= ext.HototShortUrl.user_api_key + '&';
            }
            if (service.params.extra) {
                ext.HototShortUrl.service_url+= $.param(service.params.extra) + '&';
            }
            ext.HototShortUrl.service_url += service.params.long_url + '=';
        } else {
            ext.HototShortUrl.prefs.get('other', function(key, val) {
                ext.HototShortUrl.service_url = val;
            });
        }
        utility.Console.out('Short URL: ' + ext.HototShortUrl.service_url);
    }); //
},

on_btn_short_url_clicked:
function on_btn_short_url_clicked(event) {
    var procs = [];
    var urls = [];
    var _requset = function (i) {
        var req_url = ext.HototShortUrl.service_url + urls[i];
        procs.push(function () {
            lib.network.do_request('GET',
            req_url,
            {},
            {},
            [],
            function (results) {
                var text = $('#tbox_status').val();
                text = text.replace(urls[i], $.trim(results));
                $('#tbox_status').val(text);
                $(window).dequeue('_short_url');
            },
            function () {}
            );
        });
    };
    var match = ui.Template.reg_link_g.exec($('#tbox_status').val());
    while (match != null) {
        urls.push(match[1]);
        match = ui.Template.reg_link_g.exec($('#tbox_status').val());
    }
    utility.Console.out(JSON.stringify(urls))
    for (var i = 0; i < urls.length; i += 1) {
        _requset(i);
    }
    $(window).queue('_short_url', procs);
    $(window).dequeue('_short_url');
},

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var prefs = {
        service: $('#ext_hotot_short_url_service').val(),
        login: $('#ext_hotot_short_url_login input').val(),
        api_key: $('#ext_hotot_short_url_api_key input').val(),
        other: $('#ext_hotot_short_url_other input').val()
    };
    var service = ext.HototShortUrl.services[prefs.service];
    if ((service.url
        && (service.params.login && prefs.login == ''
            || service.params.api_key && prefs.api_key == ''))
        || (service.url == undefined && prefs.other == '')) {
        ui.Notification.set('Please fill form fields for ' + service.name + '.').show();
        return;
    }
    ext.HototShortUrl.prefs.set('service', prefs.service);
    if (service.params.login) {
        ext.HototShortUrl.prefs.set(prefs.service + '_login', prefs.login);
    }
    if (service.params.api_key) {
        ext.HototShortUrl.prefs.set(prefs.service + '_api_key', prefs.api_key);
    }
    if (service.url == undefined) {
        ext.HototShortUrl.prefs.set('other', prefs.other);
    }
    ext.HototShortUrl.set_service_url(prefs.service);
    ui.DialogHelper.close(ui.CommonDlg);
},

load:
function load() {
    ext.HototShortUrl.prefs = new ext.Preferences(ext.HototShortUrl.id);
    ext.HototShortUrl.prefs.get('service', function(key, val) {
        if (val == null) {
            for (val in ext.HototShortUrl.services) {
                break;
            }
        }
        ext.HototShortUrl.set_service_url(val);
    });
    $('#btn_shorturl').unbind('click').bind('click', ext.HototShortUrl.on_btn_short_url_clicked).show();
},

unload:
function unload() {
    $('#btn_shorturl').unbind('click').hide();
},

options:
function options() {
    content = '<p>\
        <label>Short URL Service:</label> \
        <select id="ext_hotot_short_url_service" class="dark">\
        </select>\
        </p><p id="ext_hotot_short_url_login">\
        <label>Login:</label> \
        <input type="text" class="dark" />\
        </p><p id="ext_hotot_short_url_api_key">\
        <label>API Key:</label> \
        <input type="text" class="dark" />\
        </p><p id="ext_hotot_short_url_other">\
        <label>Other Short URL Endpoint:</label> \
        <input type="text" class="dark" /><br />\
        <span style="font-size:10px;">\
            Long URL will be pass as value for the last argument, \
            e.g: \'http://domain.tld/?longurl=\' and server response should be \
            only the short URL in plain text.\
        </span>\
        </p>';
    ui.CommonDlg.reset();
    ui.CommonDlg.set_title('Options for Hotot Short URL');
    ui.CommonDlg.set_content(content);
    ui.CommonDlg.add_button('ext_btn_hotot_short_url_save', 'Save',
        'Save Your Changes', ext.HototShortUrl.on_btn_save_prefs_clicked);
    $.each(ext.HototShortUrl.services, function(index, service) {
        $('#ext_hotot_short_url_service').append(
            $('<option>').val(index).html(service.name)
        );
    });
    $('#ext_hotot_short_url_service').change(function() {
        ext.HototShortUrl.services[$(this).val()].url
            ? $('#ext_hotot_short_url_other').hide()
            : $('#ext_hotot_short_url_other').show();
        ext.HototShortUrl.services[$(this).val()].params.login
            ? $('#ext_hotot_short_url_login').show()
            : $('#ext_hotot_short_url_login').hide();
        ext.HototShortUrl.services[$(this).val()].params.api_key
            ? $('#ext_hotot_short_url_api_key').show()
            : $('#ext_hotot_short_url_api_key').hide();
        ext.HototShortUrl.prefs.get('other', function(key, val) {
            $('#ext_hotot_short_url_other input').val(val);
        });
        ext.HototShortUrl.prefs.get($(this).val() + '_login', function(key, val) {
            $('#ext_hotot_short_url_login input').val(val)
        });
        ext.HototShortUrl.prefs.get($(this).val() + '_api_key', function(key, val) {
            $('#ext_hotot_short_url_api_key input').val(val);
        });
    });
    ext.HototShortUrl.prefs.get('service', function(key, val) {
        if (val == null) {
            for (val in ext.HototShortUrl.services) {
                break;
            }
        }
        $('#ext_hotot_short_url_service').val(val).change();
    });
    ui.DialogHelper.open(ui.CommonDlg);
},

}

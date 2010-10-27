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
    'is.gd': {
        name: 'is.gd',
        url: 'http://is.gd/api.php',
        params: {
            long_url: 'longurl',
        }
    },
    'tinyurl.com': {
        name: 'TinyURL',
        url: 'http://tinyurl.com/api-create.php',
        params: {
            long_url: 'url',
        }
    },
    'bit.ly': {
        name: 'Bit.ly',
        url: 'http://api.bit.ly/v3/shorten',
        params: {
            login: 'login',
            api_key: 'apiKey',
            long_url: 'longUrl',
        },
    },
    'kcy.me': {
        name: 'Karmacracy',
        url: 'http://kcy.me/api/',
        params: {
            login: 'u',
            api_key: 'key',
            long_url: 'url',
        },
    },
    'other': {
        name: 'Other',
        url: undefined,
        params: {}
    }
},

default_short_url: ui.StatusBox.short_url_base,

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var short_url = $('#ext_hotot_short_url_other input').val();
    ext.HototShortUrl.prefs.set('short_url', short_url);
    if (short_url == '') {
        ui.StatusBox.short_url_base = ext.HototShortUrl.default_short_url;
    } else {
        ui.StatusBox.short_url_base = short_url;
    }
    ui.DialogHelper.close(ui.CommonDlg);
},

load:
function load() {
    ext.HototShortUrl.prefs = new ext.Preferences(ext.HototShortUrl.id);
    ext.HototShortUrl.prefs.get('short_url', function(key, val) {
        if (val != '') {
            ui.StatusBox.short_url_base = val;
        }
    });
},

unload:
function unload() {
    ui.StatusBox.short_url_base = ext.HototShortUrl.default_short_url;
},

options:
function options() {
    content = '<p>\
        <label>Short URL Service:</label> \
        <select id="ext_hotot_short_url_service" class="dark">\
        </select></p><p id="ext_hotot_short_url_login">\
        <label>Login:</label> \
        <input type="text" class="dark" /></p><p id="ext_hotot_short_url_api_key">\
        <label>API Key:</label> \
        <input type="text" class="dark" /></p><p id="ext_hotot_short_url_other">\
        <label>Other Short URL Endpoint:</label> \
        <input type="text" class="dark" /><br />\
        <span style="font-size:10px;">\
            Long URL will be pass as value for the last argument, \
            e.g: \'http://domain.tld/?longurl=\' and server response should be \
            only the short URL in plain text.\
        </span></p>';
    ui.CommonDlg.reset();
    ui.CommonDlg.set_title('Options for Hotot Short URL');
    ui.CommonDlg.set_content(content);
    ui.CommonDlg.add_button('ext_btn_hotot_short_url_save',
        'Save', 'Save Your Changes',
        ext.HototShortUrl.on_btn_save_prefs_clicked);
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
    }).change();

    $('#ext_hotot_short_url_other input').val(ui.StatusBox.short_url_base);

    ui.DialogHelper.open(ui.CommonDlg);
},

}

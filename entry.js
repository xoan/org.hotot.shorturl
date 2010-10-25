if (typeof ext == 'undefined') var ext = {};

ext.HototShortUrl = {

id: 'org.hotot.shorturl',

name: 'Hotot Short URL',

description: 'To configure short URL services.',

version: '1.0',

author: 'Xoan Sampaiño',

url: 'http://github.com/xoan/org.hotot.shorturl',

icon: 'icon.png',

default_short_url: ui.StatusBox.short_url_base,

on_btn_save_prefs_clicked:
function on_btn_save_prefs_clicked(event) {
    var short_url = $('#ext_hotot_short_url_short_url').val();
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
        <label>Short URL:</label> \
        <input type="text" id="ext_hotot_short_url_short_url" class="dark" /></p>';
    ui.CommonDlg.reset();
    ui.CommonDlg.set_title('Options for Hotot Short URL');
    ui.CommonDlg.set_content(content);
    ui.CommonDlg.add_button('ext_btn_hotot_short_url_save',
        'Save', 'Save Your Changes',
        ext.HototShortUrl.on_btn_save_prefs_clicked);
    $('#ext_hotot_short_url_short_url').val(ui.StatusBox.short_url_base);

    ui.DialogHelper.open(ui.CommonDlg);
},

}

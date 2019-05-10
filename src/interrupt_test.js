/* jshint asi: false */
import can from 'can';
import './can-interrupt';
import 'steal-qunit';
import 'can/map/define/';

var Recipe = can.Map.extend({});

QUnit.test('changes don\'t set when cancelled - remove', function(assert) {
    var ready = assert.async();
    var recipe = new Recipe({
        name: 'cheese',
        level: 'hard',
        type: 'dairy'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'name') {
            event.cancel();
            ready();
        }
    });

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.removeAttr('name');
    recipe.attr('type', 'cream');
    can.transaction.stop();

    assert.equal(recipe.attr('name'), 'cheese', 'Property NOT SET');
    assert.equal(recipe.attr('level'), 'hard', 'Property NOT SET');
    assert.equal(recipe.attr('type'), 'dairy', 'Property NOT SET');
});

QUnit.test('changes set on resume - remove', function(assert) {
    var ready = assert.async();
    var recipe = new Recipe({
        cups: 10,
        flour: true,
        salt: 'kosher'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'flour') {
            event.resume();
            ready();
        }
    });

    can.transaction.start();
    recipe.attr('cups', 235);
    recipe.removeAttr('flour');
    recipe.attr('salt', 'sea');
    can.transaction.stop();

    assert.equal(recipe.attr('cups'), 235, 'Property SET');
    assert.equal(recipe.attr('flour'), undefined, 'Property SET');
    assert.equal(recipe.attr('salt'), 'sea', 'Property SET');
});

QUnit.test('pause', function(assert) {
    var ready = assert.async();
    var recipe = new Recipe({
        name: 'cheese',
        level: 'hard',
        type: 'dairy'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'name') {
            event.pause(function(){
                event.cancel();
                ready();
            });
        }
    });

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.removeAttr('name');
    recipe.attr('type', 'cream');
    can.transaction.stop();

    assert.equal(recipe.attr('name'), 'cheese', 'Property NOT SET');
    assert.equal(recipe.attr('level'), 'hard', 'Property NOT SET');
    assert.equal(recipe.attr('type'), 'dairy', 'Property NOT SET');
});

QUnit.test('changes don\'t set when cancelled - change', function(assert) {
    var ready = assert.async();
    var recipe = new Recipe({
        name: 'cheese',
        level: 'hard',
        type: 'dairy'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[1];
        if (mapProperty === 'name') {
            event.cancel();
            ready();
        }
    });

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.attr('name', 'blah');
    recipe.attr('type', 'cream');
    can.transaction.stop();

    assert.equal(recipe.attr('name'), 'cheese', 'Property NOT SET');
    assert.equal(recipe.attr('level'), 'hard', 'Property NOT SET');
    assert.equal(recipe.attr('type'), 'dairy', 'Property NOT SET');
});

QUnit.test('changes set on resume - change', function(assert) {
    var ready = assert.async();
    var recipe = new Recipe({
        cups: 10,
        flour: true,
        salt: 'kosher'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[1];
        if (mapProperty === 'flour') {
            event.resume();
            ready();
        }
    });

    can.transaction.start();
    recipe.attr('cups', 235);
    recipe.attr('flour', 'true');
    recipe.attr('salt', 'sea');
    can.transaction.stop();

    assert.equal(recipe.attr('cups'), 235, 'Property SET');
    assert.equal(recipe.attr('flour'), 'true', 'Property SET');
    assert.equal(recipe.attr('salt'), 'sea', 'Property SET');
});

QUnit.test('changes set without interrupt', function(assert) {

    var recipe = new Recipe({
        cups: 10,
        flour: true,
        salt: 'kosher'
    });

    can.transaction.start();
    recipe.attr('cups', 235);
    recipe.attr('flour', false);
    recipe.attr('salt', 'sea');
    can.transaction.stop();

    assert.equal(recipe.attr('cups'), 235, 'Property SET');
    assert.equal(recipe.attr('flour'), false, 'Property SET');
    assert.equal(recipe.attr('salt'), 'sea', 'Property SET');

});

if(can.route.batch) {
    QUnit.test('can.route can be interrupted', function(assert) {
        var ready = assert.async();

        var AppState = can.Map.extend({
            define: {
                flour: {
                    value: "true",
                    serialize: false
                }
            }
        });
        var appState = new AppState();

        can.route.map(appState);
        can.route.bind("changing", function(event){
            var mapProperty = event.args[1];
            if (mapProperty === 'flour') {
                event.cancel();
                ready();
            }
        });
        can.route(':flour');
        can.route.ready();

        location.hash = "#!flour=false";

        assert.equal(can.route.attr('flour'), "true", 'Property NOT SET');
    });
}

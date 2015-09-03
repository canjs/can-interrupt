# can-interrupt
can-interrupt allows you to interrupt the setting of a property (or properties) on can.Map in a transaction. One use case 
of this is interrupting the setting of an AppState on route change when a user is attempting to leave a page with 
unsaved changes. By interrupting the setting of the route in a transaction, you can interrupt the application's state
change, present the user with a confirmation prompt notifying them of their unsaved changes, and ask them if they 
want to proceed and lose their changes, or stay on the page and save their changes. In fact, Can Interrupt was designed
with this use case in mind. A few examples will illustrate the use of Can Interrupt.

##Using Can Interrupt
Setting up a can.Map to use Can Interrupt involves the following steps:

1. Bind the can.Map to the `changing` event:

```js
    
    myCanMap.bind("changing", function (event) {
           //See examples below for working with the event object methods
    }); 
    
```

The work you will do when Can Interrupt interrupts the setting of the can.Map will happen here. The `event` object passed
in to the callback function contains `pause`, `resume`, and `cancel` methods you can use to manage the transaction.

2. If you are not using Can Interrupt with can.route, wrap the changes you want to encapsulate in a can.transaction:

```js

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.attr('name', 'blah');
    recipe.attr('type', 'cream');
    can.transaction.stop();

```

If you are using Can Interrupt with can.route, you do not need this step. All you need to do is bind the route to the
`changing` event, as described in step 1, above. Can Interrupt will manage wrapping route changes in a transaction for you.

##Examples

1. Use with a standard can.Map. In this example Can Interrupt inspects the properties being set, and if the 
name property is among the properties being set, it cancels the transaction, and reverts the changes to the
can.Map:

```js

    //Define a Recipe can.Map
    var Recipe = can.Map.extend({
        define: {
            name: {
                value: 'cheese'
            },
            level: {
                value: 'hard'
            },
            type: {
                value: 'dairy'
            }
        }
    });
    
    //Create an instance of the Recipe can.Map
    var recipe = new Recipe();

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'name') {
            event.cancel();
        }
    });

    //Open a transaction
    can.transaction.start();
    //Change properties on the recipe instance
    recipe.attr('level', 'easy');
    recipe.removeAttr('name');
    recipe.attr('type', 'cream');
    //End the transaction
    can.transaction.stop();

    //The properties are unchanged
    //recipe.attr('name') --> 'cheese';
    //recipe.attr('level') --> 'hard';
    //recipe.attr('type') --> 'dairy';
```

2. Use with can.route. This example highlights the use of pausing the transaction to allow for user input.

```js

    can.route.bind("changing", function (event) {

        if(hasUnsavedChanges) {

            event.pause(function () {

                //Add the current path to the browser history
                var path = can.route.param(can.route.data.serialize(), true);
                can.route._call("setURL", path, []);

                //Present the user with a confirmation dialog
                showConfirmationDialog({
                    text: 'Leaving the page will cause you to lose your unsaved changes. Would you like to continue?',
                })
                //The user has chosen to stay on the page, cancel the transaction
                .then(function cancel (d) {
                    event.cancel();
                }, 
                //The user has chosen to leave the page, resume the transaction
                function proceed (d) {
                    event.resume();
                });
            });

        } else {
            //There are no unsaved changes, resume the transaction
            event.resume();
        }

    });

```

##Methods

Can Interrupt provides the following methods:

###can.transaction

1. `can.transaction.start` Used to begin a transaction set. Once you have called the `start` method, all changes to watched can.Maps will be tracked.  
2. `can.transaction.stop` Used to end a transaction set. Once you call the `stop` method, the changes to watched can.Maps will either be committed or ignored and no further changes will be tracked.

###can.transaction event object
When you bind a can.Map, or can.route to the `changing` event, your event handler will receive an `event` object. This object has the following methods:

1. `pause` Used to pause the setting of the values of the can.Map until either the `resume` or `cancel` methods have been called.
2. `resume` Used to resume the committing of changes to the watched can.Map (this will cause your changes to the map to be saved).
3. `cancel` Used to ignore (or roll back) changes to the watched can.Map (this will prohibit your changes to the map from being saved).
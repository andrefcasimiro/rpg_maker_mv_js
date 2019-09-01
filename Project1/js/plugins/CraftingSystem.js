
/*:
* @plugindesc Allow for player movement to cycle between 3 character sheets: idle, walk and run.
* @author FBU <andrefcasimiro(at)gmail.com>
*/

(function() {

  var parameters = PluginManager.parameters('CraftingSystem');

  var dictionary = {
    CRAFT_COMMAND: 'craft',
  }

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === 'CraftingSystem') {
      var action = args[0];

      switch (action) {
        case 'open':
          SceneManager.push(Scene_Crafting);
          break;
        default:
          return;
      }
    }
  };

  function Scene_Crafting() {
    this.initialize.apply(this, arguments);
  }

  Scene_Crafting.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_Crafting.prototype.constructor = Scene_Crafting;

  Scene_Crafting.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_Crafting.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);

    // Crafting List Window
    this._indexWindow = new Window_CraftingList(0, 0);
    this._indexWindow.setHandler('cancel', this.popScene.bind(this));

    // Ingredients List Window
    var wx = this._indexWindow.width;
    var ww = Graphics.boxWidth - wx;
    var wh = Graphics.boxHeight;

    this._statusWindow = new Window_Ingredients_List(wx, 0, ww, wh);
    this.addWindow(this._indexWindow);
    this.addWindow(this._statusWindow);
    this._indexWindow.setStatusWindow(this._statusWindow);
    this.createCommandWindow();
  };

  //-----------------------------------------------------------------------------
  // Window_CraftCommand
  //
  // The window for the crafting items command

  function Window_CraftCommand() {
    this.initialize.apply(this, arguments);
  }

  Window_CraftCommand.prototype = Object.create(Window_Command.prototype);
  Window_CraftCommand.prototype.constructor = Window_CraftCommand;

  Window_CraftCommand.prototype.initialize = function(width, purchaseOnly) {
    this._windowWidth = width;
    this._purchaseOnly = purchaseOnly;
    Window_Command.prototype.initialize.call(this, 0, 0);
  };

  Window_CraftCommand.prototype.windowWidth = function() {
    return this._windowWidth;
  };

  Window_CraftCommand.prototype.maxCols = function() {
    return 3;
  };

  Window_CraftCommand.prototype.makeCommandList = function() {
    this.addCommand(dictionary.CRAFT_COMMAND, 'craft', true);
  };

  Scene_Crafting.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_CraftCommand(0, 0);
    this._commandWindow.y = this._statusWindow.height;

    this._commandWindow.setHandler('craft', this.craft.bind(this));
    this.addWindow(this._commandWindow);
  };

  Scene_Crafting.prototype.craft = function() {
    var item = this._statusWindow._item;

    console.log(item)

    this._commandWindow.activate(); // Very important
  };


  // Available craftable items
  var Window_CraftingList = function() {
    this.initialize.apply(this, arguments);
  }

  Window_CraftingList.prototype = Object.create(Window_Selectable.prototype);
  Window_CraftingList.prototype.constructor = Window_CraftingList;

  Window_CraftingList.lastTopRow = 0;
  Window_CraftingList.lastIndex = 0;

  Window_CraftingList.prototype.initialize = function(x, y) {
    var width = Graphics.boxWidth / 3;
    var height = this.fittingHeight(10);

    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.setTopRow(Window_CraftingList.lastTopRow);
    this.select(Window_CraftingList.lastIndex);
    this.activate();
  };

  Window_CraftingList.prototype.maxCols = function() {
    return 1;
  };

  Window_CraftingList.prototype.maxItems = function() {
    return this._recipesList ? this._recipesList.length : 0;
  }

  Window_CraftingList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    this.updateStatus();
  };

  Window_CraftingList.prototype.updateStatus = function() {
    if (this._statusWindow) {
      var item = this._recipesList[this.index()];
      this._statusWindow.setItem(item);
    }
  };

  Window_CraftingList.prototype.setStatusWindow = function(statusWindow) {
    this._statusWindow = statusWindow;
    this.updateStatus();
  };

  // Maps all recipes in the player inventory
  Window_CraftingList.prototype.refresh = function() {
    this._recipesList = [];

    // Check all the owned items
    var gamePartyItemIDs = Object.keys($gameParty._items);

    gamePartyItemIDs.forEach(gamePartyItemID => {
      var _item = $dataItems[gamePartyItemID]
      var note = _item && _item.note;

      if (note) {
        var noteJSON = JSON.parse(note);
        var hasRecipe = Object.keys(noteJSON)[0] === 'recipe';

        if (hasRecipe) {
          var { recipe } = noteJSON;

          // ID of the crafted item
          var itemToCraft = recipe.creates;
          var ingredients =  recipe.ingredients;

          this._recipesList.push({
            itemToCraft,
            ingredients,
          });
        }
      }
    });

    this.createContents();
    this.drawAllItems();
  };

  // Draws each craftable item on the left-top window
  Window_CraftingList.prototype.drawItem = function(index) {
    var itemToCraftID = this._recipesList[index].itemToCraft;
    var rect = this.itemRect(index);

    var width = rect.width - this.textPadding();

    this.drawItemName($dataItems[itemToCraftID], rect.x, rect.y, width);
  };

  // Required ingredients for each item
  var Window_Ingredients_List = function() {
    this.initialize.apply(this, arguments);
  }

  Window_Ingredients_List.prototype = Object.create(Window_Base.prototype);
  Window_Ingredients_List.prototype.constructor = Window_Ingredients_List;

  Window_Ingredients_List.prototype.initialize = function(x, y, width, height) {
    height = this.fittingHeight(10);

    Window_Base.prototype.initialize.call(
      this, x, y, width, height,
    );
  }

  Window_Ingredients_List.prototype.setItem = function(item) {
    if (this._item !== item) {
        this._item = item;
        this.refresh();
    }
  };

  Window_Ingredients_List.prototype.refresh = function() {
    var item = this._item;
    var x = 0;
    var y = 0;
    var lineHeight = this.lineHeight();
    this.contents.clear();

    if (!item) {
      return;
    }

    var self = this;

    item.ingredients.forEach(function(ingredientID) {
      if (!$dataItems || !$dataItems.length) {
        return;
      }

      var ingredient = $dataItems[ingredientID];

      var amount = $gameParty.numItems(ingredient);

      // Ingredient Name
      self.drawItemName(ingredient, x, y);

      x = self.textPadding();

      // Count
      self.drawText(`(x ${amount} available)`, x + self.textPadding() + 180, y);

      x = self.textPadding();
      y = lineHeight + self.textPadding();
    });
  };



})();

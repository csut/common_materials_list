// TODO: make these collections private before pushing to production
// add var before each variable declaration to take them out of the 
// global scope
CommonMaterials = new Meteor.Collection('common-materials');
MaterialNotes = new Meteor.Collection("material-notes");

var getNotesForMaterial = function(materialId) {
  return MaterialNotes.find({"parentMaterialId" : materialId});
};

var Note = function(pMap) {
  /*
  pMap should be of the form:
  {
    alert : <Boolean>
    content : <String>
  }
  */
  var ob = {}
  ob.alert = pMap.alert;
  ob.content = pMap.content;
  ob._id = new Meteor.Collection.ObjectID();
  return ob;

}

if (Meteor.isClient) {
  
  var idOfNoteConfirmingDeletion = function() {
    if (arguments.length === 0) {
      return Session.get('idOfNoteConfirmingDeletion');
    } else {
      Session.set('idOfNoteConfirmingDeletion', arguments[0])
    }
  }

  console.log(CommonMaterials.find());
  UI.registerHelper("commonMaterials", function() {
    return CommonMaterials.find();
  });
  UI.registerHelper('logThis', function() {
    // idOfNoteConfirmingDeletion(this._id);
    console.log(this);
  });
  Template.common_material_table____row.helpers({
    notes: function() {
      return getNotesForMaterial( this._id );
    },
  });
  Template.common_material_table____row.events({
    "click button.edit-row" : function(e, tmpl) {
      console.log("buton.edit-row clicked");
    }
  });
  Template.common_material_table____row____edit_mode.helpers({
    sessionIsStockedByDESI : function() {
      var sessionIs = Session.get("is-stocked-by-DESI");
      if (sessionIs !== undefined) {
        return sessionIs;
      } else {
        return this.isStockedByDESI;
      }
    },
    redOrGrey: function() {
      if (this.alert === true) {
        return "red";
      } else {
        return "grey";
      }
    },
    notes: function() {
      return getNotesForMaterial( this._id );
    },
    thisNoteConfirmingDeletion: function() {
      console.log(EJSON.equals( this._id, idOfNoteConfirmingDeletion() ));
      return EJSON.equals( this._id, idOfNoteConfirmingDeletion() );
    },
    isAddNoteBtnDisabled : function() {
       // try hookine the input val check to a reactive data source
       // like a session variable
       // maybe n each keystroke a session variable ti updated with current
       // value of #new-note-input ?
      if ( Session.get( "new-note-input--value" ) ) {
        return "";
      } else {
        return "disabled";
      }
    },
    notesInSession : function() {
      // RESUME
      return this.notes;
    }
  });
  Template.common_material_table____row____edit_mode.events({
    // save button will need to :
    // pull value of stocked UI element and save to server
    // pull value from 3 editable test fields and save to server
    'click #row--save-button' : function(e, tmpl) {
      console.log("save button clicked");
    },
    'click #is-stocked-by-DESI-dropdown--yes' : function(e, tmpl) {
      console.log('click #is-stocked-by-DESI-dropdown--yes');
      Session.set('is-stocked-by-DESI', true);
    },
    'click #is-stocked-by-DESI-dropdown--no' : function(e, tmpl) {
      console.log('click #is-stocked-by-DESI-dropdown--no');
      Session.set('is-stocked-by-DESI', false);
    },
    'click a.delete-button' : function(e, tmpl) {
      e.preventDefault();
      idOfNoteConfirmingDeletion(this._id);
      console.log("_id of note whose delete button was clicked:");
      console.log( idOfNoteConfirmingDeletion() );
    },
    'click #note--confirm-deletion--cancel' : function(e, tmpl) {
      e.preventDefault();
      idOfNoteConfirmingDeletion( undefined );
      console.log("note--confirm-deletion--cancel clicked");
    },
    'click #note--confirm-deletion--delete' : function(e, tmpl) {
      e.preventDefault();
      console.log("this");
     // TODO: implement this function, require normalizing the database
      MaterialNotes.remove({_id : this._id});
      idOfNoteConfirmingDeletion( undefined );
      console.log("note--confirm-deletion--delete clicked");
    },
    'click img.exclamation-note-suffix' : function() {
      console.log("exclamation note suffix clicked.");
      console.log(this._id);
      MaterialNotes.update({_id: this._id}, {"$set" : {alert : !this.alert}});
    },
    'click #add-note-button' : function() {
      console.log("add-note-button clicked");
      console.log($("#new-note-input").val());
      var newNote = {
        parentMaterialId : this._id, /* this is called 
        from outside of each.
        this should be the _id of the material
        */
        alert : false,
        content : $("#new-note-input").val()
      };
      // clear the input field:
      $("#new-note-input").val("");
      MaterialNotes.insert(newNote);
    },
    "keyup #new-note-input" : function() {
      Session.set( "new-note-input--value", $("#new-note-input").val() );
    }
  });
};

if (Meteor.isServer) {
  Meteor.startup( function() {
    // for development only
    CommonMaterials.remove({});
    MaterialNotes.remove({});

    var standardLabelStock = CommonMaterials.insert({
      commonName: "Standard Label Stock",
      productionName: "LBZ658500 label stock",
      dimensions: "8.5\" x 11\"",
      // notes: [new Note({alert: false, content: "sometimes called ZHS8500"}), new Note({alert: true, content: "use correct production name when you see ZHS8500"})],
      isStockedByDESI: true
    });
    // TODO: maybe delete Note class?
    // RESUME make templates use MaterialNotes collection
    MaterialNotes.insert({
      parentMaterialId : standardLabelStock,
      alert : true, 
      content : "use correct production name when you see ZHS8500"
    });
    MaterialNotes.insert({
      parentMaterialId : standardLabelStock,
      alert : false, 
      content : "sometimes called ZHS8500"
    });

  });
};

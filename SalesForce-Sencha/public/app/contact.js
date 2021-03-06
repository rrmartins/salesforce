Ext.ns('contact', 'Ext.ux');

contact.Page = '';

// model field definition
Ext.regModel('Contact', {
	fields: ['name','id']
});

contact.DataStore = new Ext.data.JsonStore({
	autoDestroy: true,
	autoLoad: true,
	storeId: 'contactStore',

	model: 'Contact',
	sorters: 'name',
	getGroupString : function(record) {
		return record.get('name')[0];
	},
	proxy: {
		type: 'ajax',
		url: '/app/Scontact/json',
		reader: {
			type: 'json',
			root: 'contacts',
			idProperty: 'id'
		}
	},
	idProperty: 'id',
});



Ext.regModel('SingleContact', {
	fields: ['name','phone','email','id', 'account_id']
});

//contact.SingleStore = '';
contact.SingleStore = new Ext.data.JsonStore({
	autoDestroy: true,
	storeId: 'singleContactStore',

	model: 'SingleContact',
	sorters: 'name',
	getGroupString : function(record) {
		return record.get('name')[0];
	},
	proxy: {
		type: 'ajax',
		url: '/app/Scontact/json',
		reader: {
			type: 'json',
			root: 'contacts',
			idProperty: 'id'
		}
	},
	idProperty: 'id',
	listeners: {
		load: {
			fn: function(store,array,success) {
				contact.DetailForm.user = store.data.items[0];
				contact.FormPanel.loadModel(contact.DetailForm.user);
				contact.FormPanel.doComponentLayout();
				contact.Page.show();
				contact.Page.setActiveItem(1,'fade');
			}
		}
	}
});



contact.ContactList = new Ext.List({
    itemTpl: '<div class="contact2"><strong>{name}</strong></div>',
    selModel: {
        mode: 'SINGLE',
        allowDeselect: false
    },
    grouped: true,
    indexBar: true,
	listeners: {
		itemtap: function(view, index, item, e  ){ 
				contact.DetailForm.url = '/app/Scontact/update';
				contact.DetailForm.items[0].title = "Contact Details";
				contact.FormPanel.doLayout();
				contact.DetailPanel.remove('contactdetailform');
				contact.FormPanel = new Ext.form.FormPanel(contact.DetailForm);
				contact.DetailPanel.insert(0,contact.FormPanel);
				contact.DetailPanel.doLayout();

				item_id = view.store.data.items[index].data.id;
				
				global.nav_stack.push({'id':item_id, 'model':'contact'});

				contact.SingleStore.proxy.url = '/app/Scontact/json?id=' + item_id;
				contact.SingleStore.load();
		 }
	},


    store: contact.DataStore,
//	width:225,
	height: '100%'
	

});

contact.ListPanel = new Ext.Panel({
	id: 'contactlistpanel',
	scroll: 'vertical',
	items: [ contact.ContactList],
	dockedItems: [
	{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [
		{
			text: 'New',
			handler: function() {
				new_contact();
			}
		}
		
		]
	}
	]
	
});

function new_contact(clone) {
	global.nav_stack.push({'model':'contact'});
	
	contact.DetailForm.url = '/app/Scontact/create';
	contact.DetailForm.items[0].title = "New contact";
	contact.FormPanel = new Ext.form.FormPanel(contact.DetailForm);
	contact.FormPanel.doLayout();
	contact.FormPanel.reset();

	contact.DetailPanel.remove('contactdetailform');
	contact.DetailPanel.insert(0,contact.FormPanel);
	contact.DetailPanel.doLayout();
	
	if(clone) {
		contact.DetailForm.user.data.object = "";
		contact.FormPanel.loadModel(contact.DetailForm.user);
	}
	
	contact.Page.setActiveItem(1,'fade');
}

function delete_contact() {
	getPage('/app/Scontact/delete?id=' + contact.DetailForm.user.data.object,false);
	contact.DataStore.load();
	contact.ContactList.refresh(); 
	global.nav_stack.push({'model':'contact'});
	navigate(); 
}



contact.DetailForm = {
	id: 'contactdetailform',
    scroll: false,
    url   : '/app/Scontact/update',
    standardSubmit : false,
    items: [
        {
            xtype: 'fieldset',
            title: 'Contact Details',
            instructions: 'Please enter the information above.',
			width: 300,
            defaults: {
//                required: true,
                labelAlign: 'left',
                labelWidth: '35%'
            },
            items: [
            {
                xtype: 'textfield',
                name : 'name',
                label: 'Name',
                useClearIcon: true,
                autoCapitalize : false
            }, {
	            xtype: 'textfield',
	            name : 'phone',
	            label: 'Phone',
	            useClearIcon: true,
	            autoCapitalize : false
	        }, {
                xtype: 'emailfield',
                name : 'email',
                label: 'Email',
                placeHolder: 'john@example.com',
                useClearIcon: true
            }, 	{
                xtype: 'hiddenfield',
                name : 'id',
                label: 'id'
	        }]
        }
    ],
    listeners : {
        submit : function(form, result){
			global.nav_stack.push({'model':'contact'});
			navigate();
			contact.DataStore.load();
			contact.ContactList.refresh(); 
			
        },
        exception : function(form, result){
			global.nav_stack.push({'model':'contact'});
			navigate();
			contact.DataStore.load();
			contact.ContactList.refresh(); 
			
        },
		afterlayout : function() {
			this.items.items[0].items.items.forEach(function(item){
				if(item.link_to && item.link_to != "") {
					if(item.value == "") {
						item.setVisible(false);
					} else {
						item.setVisible(true);
					}
				}
				if(item.name == "object") {
					item.setVisible(false);
				}
			});
		}
    },

    
};

contact.FormPanel = new Ext.form.FormPanel(contact.DetailForm);


contact.SaveButton = new Ext.Button({
    text: 'Save changes',
	ui: 'confirm',
	margin: '5 25 1 25',
    iconMask: true,
    handler: function() {
        if(contact.DetailForm.user){
            contact.FormPanel.updateRecord(contact.DetailForm.user, true);
        }
        contact.FormPanel.submit({
            waitMsg : {message:'Submitting', cls : 'demos-loading'}
        })
	}
});

contact.DetailPanel = new Ext.Panel({
	id: 'contactdetail',
	// width: '100%',
	// height: '100%',
	cls: 'detailpanel',
	scroll: 'vertical',
	items: [contact.FormPanel, contact.SaveButton],
	dockedItems: [
	{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [
		{
			text: 'Back',
			handler: function() {
				go_back();
			}
		},{
			text: 'Clone',
			handler: function() {
				new_contact(true);
			}
		},{
			text: 'Delete',
			handler: function() {
				delete_contact();
			}
		}
		]
	}
	]

});

contact.Page = new Ext.Panel({
			layout:"card",
			activeItem:0,
            // fullscreen: true,
			model_name:'contact',
            cardSwitchAnimation: 'fade',
			scroll: false,
            items: [contact.ListPanel,contact.DetailPanel]
        });

contact.Page.show();


function contact_sync_finished(){
	contactfields = getPage('/app/Scontact/model',true);
	Ext.regModel('SingleContact', {
		fields: contactfields
	});


	oldurl = contact.SingleStore.proxy.url;
	olddata = contact.DetailForm.user;
	
	contact.SingleStore = new Ext.data.JsonStore({
		autoDestroy: true,
		storeId: 'singleContactStore',

		model: 'SingleContact',
		sorters: 'name',
		getGroupString : function(record) {
			return record.get('name')[0];
		},
		proxy: {
			type: 'ajax',
			url: oldurl,
			reader: {
				type: 'json',
				root: 'contacts',
				idProperty: 'id'
			}
		},
		idProperty: 'id',
		listeners: {
			load: {
				fn: function(store,array,success) {
					contact.DetailForm.user = store.data.items[0];
					contact.FormPanel.loadModel(contact.DetailForm.user);
					contact.Page.show();
					contact.Page.setActiveItem(1,'fade');
				}
			}
		}
	});	
	
	
	
	contact.DetailForm.items[0].items = getPage('/app/Scontact/metafields',true);

	contact.DetailPanel.remove('contactdetailform');
	contact.FormPanel = new Ext.form.FormPanel(contact.DetailForm);
	contact.FormPanel.loadModel(olddata);

	contact.DetailPanel.insert(0,contact.FormPanel);
	contact.DetailPanel.doLayout();
	
	contact.DataStore.load();
	//contact.SingleStore.load();

	contact.ContactList.refresh(); 
	contact.ContactList.setLoading(false,false);
}

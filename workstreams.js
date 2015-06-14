if (Meteor.isClient) {

	//------------------------------------------------------------------------------------
	// SUBSCRIPTIONS
	//------------------------------------------------------------------------------------
		
		// WORKSTREAM---------------------------------------------------------------------
			Meteor.subscribe('workstreams');
		
		// ENTRIES---------------------------------------------------------------------
			Meteor.subscribe('entries');

	//------------------------------------------------------------------------------------
	// LAYOUT
	//------------------------------------------------------------------------------------
		
		// SIDEBAR TOGGLE-----------------------------------------------------------------
			Template.content_header.events({
				//Toggle Sidebar
				'click .sidebar-toggle': function(){
					$('.sidebar').toggleClass('sidebar--active');
					$('.content').toggleClass('content--inactive');
				}
			});

		// ADD-ENTRY FORM VISIBILITY------------------------------------------------------
			Template.content_footer.helpers({
				selectedWorkstreamSession: function() {
					var selectedWorkstreamSession = Session.get('selectedWorkstreamSession');
					var workstreamCount = Workstreams.find().count();

					if (selectedWorkstreamSession && workstreamCount != 0) {
						return true;
					};
				}
			});

		// FILTER BY TYPE SESSION---------------------------------------------------------
			// Set session if a type was selected
			Template.content_header.events({
				'change .stream-toggle': function(event) {
					var type = event.target.value;

					Session.set('streamToggleSession', type);
				}
			});

			// Only show filter when a stream is selected
			Template.content_header.helpers({
				workstreamSelected: function() {
					var selectedWorkstreamSession = Session.get('selectedWorkstreamSession');
					
					if (selectedWorkstreamSession != null) {
						return true;
					};	
				}
			});

	//------------------------------------------------------------------------------------
	// WORKSTREAMS
	//------------------------------------------------------------------------------------

		// ADD WORKSTREAMS----------------------------------------------------------------
			//WORKSTREAMS - ADD STREAM
			Template.sidebar_footer.events({
				'submit .add-stream': function(event) {
					var title = event.target.title.value;

					if (title != "") {
						Meteor.call('addWorkstream', title);

						event.target.title.value = "";
					};

					event.preventDefault();
				}
			});

		// DISPLAY WORKSTREAMS------------------------------------------------------------
			Template.sidebar_main.helpers({
				workstreams: function() {
					var currentUserId = Meteor.userId();

					return Workstreams.find({userId: currentUserId});
				}
			});

		// SELECT WORKSTREAMS-------------------------------------------------------------
			//WORKSTREAMS - SELECT STREAM (HELPER + SESSION GET)
			Template.workstream.helpers({
				selectedWorkstreamClass: function() {
					var workstreamId = this._id;
					var selectedWorkstreamSession = Session.get('selectedWorkstreamSession');
					
					if (workstreamId == selectedWorkstreamSession) {
						return 'workstream--selected';
					};
				}
			});

			//WORKSTREAMS - SELECT STREAM (EVENT + SESSION SET)
			Template.sidebar_main.events({
				'click .workstream__title': function() {
					var workstreamId = this._id;

					Session.set('selectedWorkstreamSession', workstreamId);
				}
			});

		// REMOVE WORKSTREAMS-------------------------------------------------------------

			//WORKSTREAMS - REMOVE STREAM
			Template.sidebar_main.events({
				'click .workstream__remove': function() {
					var selectedWorkstreamSession = Session.get('selectedWorkstreamSession');
					var clickedWorkstream = this._id;

					// If selected workstream gets removed, kill the session
					if (clickedWorkstream == selectedWorkstreamSession) {
						Session.set('selectedWorkstreamSession', null);
					}

					//Remove workstream
					Meteor.call('removeWorkstream', clickedWorkstream);
				}
			});

		// ANIMATIONS---------------------------------------------------------------------
			//WORKSTREAMS - ANIMATIONS
			Template.sidebar_main.animations({
				".workstream--animated": {
					container: ".sidebar__main",
					animateInitial: true,
					animateInitialDelay: 0,
					in: "slow fadeInUp",
					out: "fast fadeOutLeft"
				}
			});

	//------------------------------------------------------------------------------------
	// ENTRIES (NOTES & TASKS)
	//------------------------------------------------------------------------------------

		// ADD ENTRIES (NOTES & TASKS)----------------------------------------------------
			Template.content_footer.events({
				'submit .add-entry': function(event){
					var text = event.target.text.value;

					if (text != "") {
						var type = event.target.type.value;
						var selectedWorkstreamSession = Session.get('selectedWorkstreamSession');

						if (type == "Create Note") {
							Meteor.call('insertNote', text, selectedWorkstreamSession);
						} else {
							Meteor.call('insertTask', text, selectedWorkstreamSession);
						};
					};

					event.target.text.value = "";
					event.preventDefault();

					//Scroll to bottom
					$(".content__main").scrollTop($(".content__main")[0].scrollHeight);
				}
			});

		// DISPLAY ENTRIES (NOTES & TASKS) -----------------------------------------------
			// ENTRIES
			Template.content_main.helpers({
				entries: function(){
					var selectedWorkstreamSession = Session.get('selectedWorkstreamSession');

					if (selectedWorkstreamSession) {
						var streamToggleSession = Session.get('streamToggleSession');
						var currentUserId = Meteor.userId();

						//Display tasks only
						if (streamToggleSession == "Tasks only") {
							return Entries.find({
								workstream: selectedWorkstreamSession, 
								userId: currentUserId, 
								type: "entry--task"
							}, {
								sort: {createdAt: +1}
							});
						}
						//Display notes only
						else if (streamToggleSession == "Notes only") {
							return Entries.find({
								workstream: selectedWorkstreamSession, 
								userId: currentUserId, 
								type: "entry--note"
							}, {
								sort: {createdAt: +1}
							});
						} 
						//Display all
						else {
							return Entries.find({
								workstream: selectedWorkstreamSession, 
								userId: currentUserId
							}, {
								sort: {createdAt: +1}
							});	
						};
					};
				}
			});

		// REMOVE ENTRIES (NOTES & TASKS) ------------------------------------------------
			Template.entry.events({
				'click .entry__controls--remove': function(){
					Meteor.call('removeEntry', this._id);
				}
			});

		// COMPLETE ENTRIES (TASKS ONLY)--------------------------------------------------
			Template.entry.events({
				'click .entry--task .entry__content': function(){
					var completedAt = false;

					if (this.completed == true) {
						var completedAt = false;
					} else {
						var completedAt = new Date().toLocaleTimeString();
					};

					Meteor.call('completeEntry', this._id, !this.completed, completedAt);
				},
				'click .entry--task .entry__date': function(){
					var completedAt = false;

					if (this.completed == true) {
						var completedAt = false;
					} else {
						var completedAt = new Date().toLocaleTimeString();
					};

					Meteor.call('completeEntry', this._id, !this.completed, completedAt);
				}
			});

		// PRIORITIES (NOTES & TASKS)-----------------------------------------------------
			Template.entry.events ({
				'click .entry__controls--priority': function() {
					var currentPriority = this.priority;
					
					if (currentPriority === "") {
						var newPriority = "priority--low";
					}
					else if (currentPriority === "priority--low") {
						var newPriority = "priority--medium";
					}
					else if  (currentPriority === "priority--medium") {
						var newPriority = "priority--high";
					}
					else if (currentPriority === "priority--high") {
						var newPriority = "";
					};

					currentPriority = newPriority;

					Meteor.call('changePriority', this._id, newPriority);
				}
			});

		// ANIMATIONS---------------------------------------------------------------------
			// NOTES & TASKS - ANIMATIONS
			Template.content_main.animations({
				".entry--animated": {
					container: ".scroll-container",
					animateInitial: true,
					animateInitialDelay: 0,
					in: "slow fadeInUp"
				}
			});

		// KEYBOARD SHORTCUTS-------------------------------------------------------------
			//SHORTCUTS
			// alt + t - quickadd task
			// alt + n - quickadd note
			// alt + q - filter stream
			// alt + w - switch priority


			// QUICKADD TASK
			KeyboardJS.on('alt + t', function() {
				$(".add-entry__type select").val("Create Task");
				$(".add-entry__text").focus();
			});
			// QUICKADD NOTE
			KeyboardJS.on('alt + n', function() {
				$(".add-entry__type select").val("Create Note");
				$(".add-entry__text").focus();
			});

			// FILTER STREAM
			KeyboardJS.on('alt + q', function() {
				var streamToggleSession = Session.get('streamToggleSession');
				
				if (streamToggleSession == null || streamToggleSession == "Full Stream") {
					Session.set('streamToggleSession', "Tasks only");
					$(".stream-toggle select").val("Tasks only");
				};
				if (streamToggleSession == "Tasks only") {
					Session.set('streamToggleSession', "Notes only");
					$(".stream-toggle select").val("Notes only");
				};
				if (streamToggleSession == "Notes only") {
					Session.set('streamToggleSession', "Full Stream");
					$(".stream-toggle select").val("Full Stream");
				};
			});


			// QUICK PRIORITY
			// Check for hovered entry
			Template.content_main.events({
				'mouseenter .entry': function() {
					Session.set('hoveredEntryIdSession', this._id);
				},
				'mouseleave .entry': function() {
					Session.set('hoveredEntryIdSession', null);
				}
			});
			// Update hovered to "priority--low"
			KeyboardJS.on('alt + w', function() {
				var hoveredEntryId = Session.get('hoveredEntryIdSession');
				var hoveredEntryObject = Entries.findOne({_id: hoveredEntryId});
				var hoveredEntryPriority = hoveredEntryObject.priority;
				var newPriority = "";

				if (hoveredEntryId != null) {
					newPriority = "priority--low";
				};
				if (hoveredEntryPriority === "priority--low") {
					newPriority = "priority--medium";
				};
				if (hoveredEntryPriority === "priority--medium") {
					newPriority = "priority--high";
				};
				if (hoveredEntryPriority === "priority--high") {
					newPriority = "";
				};
				Meteor.call('changePriority', hoveredEntryId, newPriority);
			});

}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});

	//------------------------------------------------------------------------------------
	// PUBLICATIONS
	//------------------------------------------------------------------------------------
		
		// WORKSTREAM---------------------------------------------------------------------
			Meteor.publish('workstreams', function(){
				return Workstreams.find({userId: this.userId});
			});

		// ENTRIES------------------------------------------------------------------------
			Meteor.publish('entries', function(){
				return Entries.find({userId: this.userId});
			});
}

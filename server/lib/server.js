//------------------------------------------------------------------------------------
// METHODS - WORKSTREAMS
//------------------------------------------------------------------------------------

	// ADD WORKSTREAMS----------------------------------------------------------------
		Meteor.methods({
			addWorkstream: function(title){
				Workstreams.insert({
					title: title,
					userId: Meteor.userId(),
					userName: Meteor.userId().username,
					createdAt: new Date()
				});
			}
		});

	// REMOVE WORKSTREAMS-------------------------------------------------------------
		Meteor.methods({
			removeWorkstream: function(clickedWorkstream){
				//Remove clicked workstream
				Workstreams.remove(clickedWorkstream);
				//Remove entries attached to that stream
				Entries.remove({workstream: clickedWorkstream});
			}
		});

//------------------------------------------------------------------------------------
// METHODS - ENTRIES (NOTES & TASKS)
//------------------------------------------------------------------------------------

	// ADD ENTRIES (NOTES & TASKS)----------------------------------------------------
		Meteor.methods({
			//Insert Note
			insertNote: function(text, selectedWorkstreamSession){
				Entries.insert({
					type: "entry--note",
					userId: Meteor.userId(),
					userName: Meteor.userId().username,
					workstream: selectedWorkstreamSession,
					text: text,
					priority: "",
					createdAt: new Date()
				});
			},
			//Insert Task
			insertTask: function(text, selectedWorkstreamSession){
				Entries.insert({
					type: "entry--task",
					userId: Meteor.userId(),
					userName: Meteor.userId().username,
					workstream: selectedWorkstreamSession,
					text: text,
					priority: "",
					completed: false,
					completedAt: false,
					createdAt: new Date()
				});
			}

		});

	// REMOVE ENTRIES (NOTES & TASKS)-------------------------------------------------
		Meteor.methods({
			removeEntry: function(id){
				Entries.remove(id);
			}
		});

	// COMPLETE ENTRIES (TASKS ONLY)--------------------------------------------------
			Meteor.methods({
				completeEntry: function(id, completed, completedAt) {
					Entries.update(id, {$set: {completed: completed, completedAt: completedAt}});
				}
			});

	// PRIORITIES (NOTES & TASKS)-----------------------------------------------------
			Meteor.methods({
				changePriority: function(id, newPriority) {
					Entries.update(id, {$set: {priority: newPriority}});
				}
			});
$(function(){

	if ($(".tags-edit").length) {
		tagsEditView = new TagsEditView({
				tags: 		tags,
				projects: 	projects
			});
	}
});	
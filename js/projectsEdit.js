$(function(){

	if ($(".projects-edit").length) {
		projectsEditView = new ProjectsEditView({
				tags: 		tags,
				projects: 	projects
			});
	}
});	
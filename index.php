<?php

require 'vendor/autoload.php';

$app = new \Slim\Slim(array(
    'view' => new \Slim\Views\Twig()
));

// GET route
$app->get(
    '/',
    function () use ($app) {

        $app->render(
            'index.html',
            array(
                'tags' => getTags(),
                'projects' => getProjects(),
                'tasks' => getTasks(),
                'page' => 'home'
            )
        );
    }
);

$app->get(
    '/summary',
    function () use ($app) {

        $app->render(
            'summary_report.html',
            array(
                'tags' => getTags(),
                'projects' => getProjects(),
                'tasks' => getTasks(),
                'page' => 'summary'
            )            
        );
    }
);

$app->get(
    '/weekly',
    function () use ($app) {

        $app->render(
            'weekly_report.html',
            array(
                'tags' => getTags(),
                'projects' => getProjects(),
                'tasks' => getTasks(),
                'page' => 'weekly'
            )
        );
    }
);

// get tasks
$app->get(
    '/tasks(/:begin/:end)',
    function ($begin = NULL, $end = NULL) use ($app) {

        echo getTasks($begin, $end);

    }
);

// get tasks descs
$app->post(
    '/descstasks',
    function () use ($app) {

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "select * from tasks where `desc` like '%" . $data->term . "%' GROUP BY `desc`,`tags`";

            $stmt = $db->prepare($sql);
            $stmt->execute();

            $tasks = $stmt->fetchAll(PDO::FETCH_OBJ);

            $db = null;

            $result = json_encode($tasks);
        } catch(PDOException $e) {
            $result = '{"error":{"text":'. $e->getMessage() .'}}';
        }

        echo $result;

    }
);

// create task
$app->post(
    '/task',
    function () use ($app) {

        $data = json_decode($app->request()->getBody());

        $begin_time_json = json_encode(array(array('b' => $data->begin_period)));

        try
        {
            $db = getConnection();

            $sql = "insert into tasks (`status`, `desc`, `project_id`, `date`, `tags`, `periods`) values(?, ?, ?, ?, ?, ?)";

            $stmt = $db->prepare($sql);
            $stmt->execute(array(

                $data->status,
                $data->desc,
                $data->project_id,
                $data->date,
                $data->tags,
                $begin_time_json,
            ));
            $data->id = $db->lastInsertId();

            echo json_encode($data);
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
);

// update
$app->put(
    '/task/:id',
    function ($id) use ($app) {

        $without_periods = 0;
        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            if ($data->status == 1) {
                if ($data->new_task == 1) {
                    $sql = "select periods from tasks where id=".$id;

                    $stmt = $db->prepare($sql);
                    $stmt->execute();

                    $periods = $stmt->fetchColumn();

                    $periods = json_decode($periods);

                    array_push($periods, array('b' => $data->begin_period));

                    $periods = json_encode($periods);
                } else {
                    $without_periods = 1;
                }
            } else {
                if (isset($data->end_period)) {
                    if ($data->end_period) {
                        $sql = "select periods from tasks where id=".$id;

                        $stmt = $db->prepare($sql);
                        $stmt->execute();

                        $periods = $stmt->fetchColumn();

                        $periods = json_decode($periods);
                        $periods[count($periods) - 1]->e = $data->end_period;
                        $periods = json_encode($periods);
                    }
                } else {
                    $without_periods = 1;
                }
            }

            if ($without_periods) {
                $sql = "update tasks set `time` = :time, `time_str` = :time_str, `desc` = :desc, `project_id` = :project_id, `tags` = :tags, `status` = :status where id=".$id;
            } else {
                $sql = "update tasks set `time` = :time, `time_str` = :time_str, `desc` = :desc, `project_id` = :project_id, `tags` = :tags, `periods` = :periods, `status` = :status where id=".$id;                
            }

            $stmt = $db->prepare($sql);
            $stmt->bindParam(":time", $data->time);
            $stmt->bindParam(":time_str", $data->time_str);
            $stmt->bindParam(":desc", $data->desc);
            $stmt->bindParam(":project_id", $data->project_id);
            $stmt->bindParam(":tags", $data->tags);
            if (!$without_periods) {
                $stmt->bindParam(":periods", $periods);
            }
            $stmt->bindParam(":status", $data->status);
            $stmt->execute();

            echo '{"status_update": "ok"}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);

// delete task
$app->delete(
    '/task/:id',
    function ($id) use ($app) {

        try
        {
            $db = getConnection();

            $sql = "delete from tasks where id=".$id;
            $stmt = $db->prepare($sql);
            $stmt->execute();

            echo '{"status": "ok"}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);


// get projects
$app->get(
    '/projects',
    function () use ($app) {

        echo getProjects();

    }
);


// create project 
$app->post(
    '/project',
    function () use ($app) {

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "insert into projects (`name`, `color`) values(?, ?)";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                $data->name,
                $data->color
            ));
            $data->id = $db->lastInsertId();

            echo json_encode($data);
        } catch(PDOException $e) {
            echo '{"error project":{"text":'. $e->getMessage() .'}}';
        }
    }
);

// update project
$app->put(
    '/project/:id',
    function ($id) use ($app) {

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "update projects set `name` = :name, `color` = :color where id=".$id;

            $stmt = $db->prepare($sql);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":color", $data->color);
            $stmt->execute();

            echo '{"status_update": "ok"}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);

// get projects
$app->get(
    '/projectsedit',
    function () use ($app) {

        $app->render(
            'projects_edit.html',
            array(
                'tags' => getTags(),
                'projects' => getProjects(),
            )
        );

    }
);

// get tags
$app->get(
    '/tags',
    function () use ($app) {

        echo getTags();

    }
);

// update
$app->put(
    '/tag/:id',
    function ($id) use ($app) {

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "update tags set `name` = :name, `color` = :color where id=".$id;

            $stmt = $db->prepare($sql);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":color", $data->color);
            $stmt->execute();

            echo '{"status_update": "ok"}';
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }

    }
);

// get tags
$app->get(
    '/tagsedit',
    function () use ($app) {

        $app->render(
            'tags_edit.html',
            array(
                'tags' => getTags(),
                'projects' => getProjects(),
            )
        );

    }
);

// create tag 
$app->post(
    '/tag',
    function () use ($app) {

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "insert into tags (`name`, `color`) values(?, ?)";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                $data->name,
                $data->color
            ));
            $data->id = $db->lastInsertId();

            echo json_encode($data);
        } catch(PDOException $e) {
            echo '{"error project":{"text":'. $e->getMessage() .'}}';
        }
    }
);

//sample
// $app->get(
//     '/task/:id',
//     function ($id) use ($app) {
//         echo '{"get":{"text":'. $id.'}}';
//     }
// );

$app->run();

function getConnection() {
    $dbhost="127.0.0.1";
    $dbuser="root";
    $dbpass="root";
    $dbname="timer";

    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);  
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}

function getTags() {

    try
    {
        $db = getConnection();

        $sql = "select * from tags";
        $stmt = $db->prepare($sql);
        $stmt->execute();

        $tags = $stmt->fetchAll(PDO::FETCH_OBJ);

        $db = null;            

        $result = json_encode($tags);
    } catch(PDOException $e) {
        $result = '{"error":{"text":'. $e->getMessage() .'}}';
    }

    return $result;

}

function getProjects() {

    try
    {
        $db = getConnection();

        $sql = "select * from projects";
        $stmt = $db->prepare($sql);
        $stmt->execute();

        $projects = $stmt->fetchAll(PDO::FETCH_OBJ);

        $db = null;            

        $result = json_encode($projects);
    } catch(PDOException $e) {
        $result = '{"error":{"text":'. $e->getMessage() .'}}';
    }

    return $result;

}

function getTasks($begin_period = NULL, $end_period = NULL) {

    try
    {
        $db = getConnection();

        if (!$begin_period && !$end_period) {

            $sql = "select * from tasks order by id desc limit 1";
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $last_tasks = $stmt->fetchAll(PDO::FETCH_OBJ);

            $begin_period = date('Y-m-d', strtotime($last_tasks[0]->date . " -7 days"));

            $sql = "select * from tasks where `date` >= '" . $begin_period . "'";

        } else {
            $sql = "select * from tasks where `date` >= '" . $begin_period . "' AND `date` < '" . $end_period . "'";
        }

        $stmt = $db->prepare($sql);
        $stmt->execute();
        $tasks = $stmt->fetchAll(PDO::FETCH_OBJ);

        if (count($tasks) == 0) {
            $sql = "select * from tasks where `date` < '" . $begin_period . "' order by id desc limit 20";
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $tasks = $stmt->fetchAll(PDO::FETCH_OBJ);
        }

        $db = null;

        $result = json_encode($tasks);
    } catch(PDOException $e) {
        $result = '{"error":{"text":'. $e->getMessage() .'}}';
    }

    return $result;

}
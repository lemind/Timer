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

// get tasks
$app->get(
    '/tasks',
    function () use ($app) {

        echo getTasks();

    }
);

// create task
$app->post(
    '/task',
    function () use ($app) {

        //$data = json_decode(file_get_contents('php://input'));
        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "insert into tasks (`time`, `time_str`,`desc`, `project_id`, `tags`, `date`) values(?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                $data->time,
                $data->time_str,
                $data->desc,
                $data->project_id,
                $data->tags,
                $data->date
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

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

            $sql = "update tasks set `time` = :time, `time_str` = :time_str, `desc` = :desc, `project_id` = :project_id, `tags` = :tags where id=".$id;
            $stmt = $db->prepare($sql);
            $stmt->bindParam(":time", $data->time);
            $stmt->bindParam(":time_str", $data->time_str);
            $stmt->bindParam(":desc", $data->desc);
            $stmt->bindParam(":project_id", $data->project_id);
            $stmt->bindParam(":tags", $data->tags);
            $stmt->execute();

            echo '{"status": "ok"}';
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

// get tags
$app->get(
    '/tags',
    function () use ($app) {

        echo getTags();

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

function getTasks() {

    try
    {
        $db = getConnection();

        $sql = "select * from tasks";
        //$sql = "select * from tasks order by `id` desc";
        $stmt = $db->prepare($sql);
        $stmt->execute();

        $tasks = $stmt->fetchAll(PDO::FETCH_OBJ);

        $db = null;

        $result = json_encode($tasks);
    } catch(PDOException $e) {
        $result = '{"error":{"text":'. $e->getMessage() .'}}';
    }

    return $result;

}
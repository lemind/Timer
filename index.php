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

//temp test
$app->get(
    '/test',
    function () use ($app) {

        $begin = new DateTime();
        echo $begin->format('U = Y-m-d H:i:s') . "<br>";
        echo $begin->format('H:i:s') . "<br>";
        $q = array(array('b' => $begin->format('H:i:s')));
        $qtest = array(array('b' => $begin->format('H:i:s'), 'e' => $begin->format('H:i:s')),
                       array('b' => $begin->format('H:i:s')));

        // $qtest[count($qtest) - 1];
        // //array_push($qtest[count($qtest) - 1], array('e' => $begin->format('H:i:s')));
        // $qtest[count($qtest) - 1]['e'] = $begin->format('H:i:s');
        // echo json_encode($q);
        // print_r($qtest);
        // echo('<br>');
        // echo('<br>');
        // echo json_encode($qtest);

            $db = getConnection();

                $sql = "select periods from tasks where id=598";

                $stmt = $db->prepare($sql);
                $stmt->execute();

                $periods = $stmt->fetchColumn();

                var_dump($periods);
                echo("<br>");
                echo("<br>");

                $periods = json_decode($periods); 
                print_r($periods[count($periods) - 1]);       


    }
);

// create task
$app->post(
    '/task',
    function () use ($app) {

        $data = json_decode($app->request()->getBody());

        $begin_time = new DateTime();
        $begin_time_json = json_encode(array(array('b' => $begin_time->format('H:i:s'))));

        try
        {
            $db = getConnection();

            $sql = "insert into tasks (`status`, `desc`, `project_id`, `date`, `tags`, `periods`) values(?, ?, ?, ?, ?, ?)";

            $stmt = $db->prepare($sql);
            $stmt->execute(array(

                $data->status,
                $data->desc,
                $data->project_id,
                $begin_time->format('Y-m-d'),
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

        $data = json_decode($app->request()->getBody());

        try
        {
            $db = getConnection();

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
                $periods = $data->periods;
            }

            //start old task
            if ($data->status == 1) {
                $sql = "select periods from tasks where id=".$id;

                $stmt = $db->prepare($sql);
                $stmt->execute();

                $periods = $stmt->fetchColumn();

                $periods = json_decode($periods);

                $begin = new DateTime();
                array_push($periods, array('b' => $begin->format('H:i:s')));

                $periods = json_encode($periods);
            }

            $sql = "update tasks set `time` = :time, `time_str` = :time_str, `desc` = :desc, `project_id` = :project_id, `tags` = :tags, `periods` = :periods, `status` = :status where id=".$id;
            $stmt = $db->prepare($sql);
            $stmt->bindParam(":time", $data->time);
            $stmt->bindParam(":time_str", $data->time_str);
            $stmt->bindParam(":desc", $data->desc);
            $stmt->bindParam(":project_id", $data->project_id);
            $stmt->bindParam(":tags", $data->tags);
            $stmt->bindParam(":periods", $periods);
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
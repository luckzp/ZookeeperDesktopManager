var zkClientMap = new Map()
var zkClient
var Zookeeper = require('node-zookeeper-client')
var OPTIONS = {
    sessionTimeout: 300000
}

function connectZK(callback) {
    var connects = localStorage.getItem('zkNames')
    if (connects != null && '' != connects) {
        if (connects.indexOf('$') == -1) {
            connectZKByName(connects, callback)
        } else {
            connects.split('$').forEach(element => {
                console.log("split zk address is ", element)
                if (element != null && '' != element) {
                    var zk = zkClientMap.get(element)
                    if (zk == undefined) {
                        zk = Zookeeper.createClient(element, OPTIONS)
                        zkClientMap.set(element, zk)
                        zk.connect()
                    } else {
                        console.log(element + " lin2 connected zk:", zk)
                        getTree(zk, element, element, callback)
                    }
                    zk.on('connected', function () {
                        console.log(element + " lin connected zk:", zk)
                        getTree(zk, element, element, callback)
                    });
                }
            });
        }
    }
}


function getTree(zk, lableName, zkName, callback) {
    const newChild = { label: lableName, children: [], path: '/', zkName: zkName }
    if ('1' == localStorage.getItem('loadMode')) {
        zk.listSubTreeBFS('/', function (error, children) {
            if (error) {
                console.log(error.stack);
                return;
            }
            var parentChild = newChild
            //console.log('Children are:', children);
            children.forEach(childPath => {
                parentChild = newChild
                //console.log('nweChild is: ', newChild)
                var len = childPath.split('/').length
                //console.log('childPath is: ', childPath, len)
                var templen = 0
                childPath.split('/').forEach(e => {
                    templen++
                    if (e != null && e != '') {
                        var flag = false
                        var index = 0
                        //console.log('splited childPath is: ', childPath, e)
                        parentChild.children.forEach((c, i) => {
                            if (c.label == e) {
                                flag = true
                                index = i
                            }
                        });
                        //console.log('flag ', flag, parentChild.children)
                        if (!flag) { //数组不包含该元素
                            console.log('不包含元素', e, childPath)
                            var temp = { label: e, children: [], path: childPath, zkName: zkName }
                            var i = parentChild.children.push(temp)
                            parentChild = parentChild.children[i - 1]
                        } else { //数组包含该元素
                            console.log('包含元素', e, childPath)
                            if (parentChild.children != null && parentChild.children.length > 0) {
                                parentChild = parentChild.children[index]
                                console.log(parentChild)
                            }
                        }
                    }
                });
            });
            callback(newChild)
        });
    } else {
        callback(newChild)
    }

}


function connectZKByName(zkName, callback) {
    var CONNECTION_STRING = zkName
    var zk = zkClientMap.get(zkName)
    if (zk == null) {
        zk = Zookeeper.createClient(CONNECTION_STRING, OPTIONS)
        zkClientMap.set(CONNECTION_STRING, zk)
        zk.connect()
        zk.on('connected', function () {
            console.log("connectZKByName connected zk:", zk)
            // getTree(zk, CONNECTION_STRING, CONNECTION_STRING, callback)
        });
    } else {
        console.log("connectZKByName connected zk:", zk)
        // getTree(zk, CONNECTION_STRING, CONNECTION_STRING, callback)
    }
    zkClient = zk;
    return zk;
}

function getChildren(path) {
    var nodes = [];
    zkClient.getChildren(path, function (error, children, stats) {
        if (error) {
            console.log(error.stack);
            return;
        }
        children.forEach((element) => {
            var childPath = path == "/" ? path + element : path + "/" + element;
            const child = { label: element, path: childPath };
            nodes.push(child);
        });
    });
    return nodes;
}

function exists(client, path) {
    client.exists(path, function (error, stat) {
        if (error) {
            console.log(error.stack);
            return false;
        }

        if (stat) {
            console.log('Node exists.');
            return true;
        } else {
            console.log('Node does not exist.');
            return false;
        }
    });
}

function getNodeData(zkName, path, callback) {
    var zk = zkClientMap.get(zkName)
    if (zk != null) {
        zk.getData(
            path,
            function (event) {
                console.log('Got event: %s.', event);
            },
            function (error, data, stat) {
                if (error) {
                    console.log(error.stack);
                    return;
                }
                var map = new Map();
                if (data != undefined) {
                    console.log('Got data: %s', data);
                    //console.log("stat", JSON.stringify(stat))
                    console.log("data hex ", data.toString('UTF-8'))
                    //console.log("stat", stat.ctime.toString('UTF-8'))
                    //console.log("stat",trans(stat.czxid))
                    map.set('data', data.toString('UTF-8'));
                }
                //若为饿加载模式则，将子节点查询出来插入Tree
                if ('2' == localStorage.getItem('loadMode')) {
                    zk.getChildren(
                        path,
                        function (event) {
                            console.log('Got watcher event: %s', event);
                        },
                        function (error, children, stat) {
                            if (error) {
                                console.log('Failed to list children of %s due to: %s.', path, error)
                                // zk = Zookeeper.createClient(zkName, OPTIONS)
                                // zkClientMap.set(zkName, zk)
                                // zk.connect()
                                // zkClientMap.put(zkName,zk)
                                // zk.on('connected', function () {
                                //     console.log("connectZKByName connected zk:", zk)
                                //     getNodeData(zkName,path,callback)
                                // });
                                return;
                            }
                            //console.log('Children of %s are: %j.', path, children);
                            var array = new Array()
                            children.forEach(element => {
                                var childPath = path == '/' ? path + element : path + '/' + element
                                const child = { label: element, children: [], path: childPath, zkName: zkName }
                                array.push(child)
                                //console.log('parent path is %s', path)
                                //console.log('child path is %s', childPath)
                            });
                            if (array.length > 0) {
                                map.set('childrenArray', array);
                            }
                            callback(map);
                        }
                    );
                } else {
                    callback(map);
                }

            }
        );
    }
}

function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
}

function testZKAccess(callback) {
    var connects = localStorage.getItem('zkNames')
    if (connects != null && '' != connects) {
        if (connects.indexOf('$') == -1) {
            var z = Zookeeper.createClient(connects, OPTIONS)
            z.connect();
            z.on('connected', function () {
                callback();
                z.close();
            });
        } else {
            connects.split('$').forEach(element => {
                console.log("split zk address is ", element)
                if (element != null && '' != element) {
                    var zk = Zookeeper.createClient(element, OPTIONS)
                    zk.connect()
                    zk.on('connected', function () {
                        callback();
                        zk.close();
                    });
                }
            });
        }
    }
}

function operateZKNode(operation, zkName, nodePath, newData, callback) {
    var zk = zkClientMap.get(zkName)
    if (zk == undefined) {
        zk = Zookeeper.createClient(zkName, OPTIONS)
        zkClientMap.set(zkName, zk)
        zk.connect()
    } else {
        if (operation == 'setData') {
            setNodeData(zk, nodePath, newData, callback);
        }
        if (operation == 'deleteNode') {
            deleteNode(zk, nodePath, callback);
        }
        if (operation == 'createNode') {
            createNode(zk, nodePath, newData, callback);
        }

    }
    zk.on('connected', function () {
        if (operation == 'setData') {
            setNodeData(zk, nodePath, newData, callback);
        }
        if (operation == 'deleteNode') {
            deleteNode(zk, nodePath, callback);
        }
        if (operation == 'createNode') {
            createNode(zk, nodePath, newData, callback);
        }
    });
}

function setNodeData(zk, nodePath, newData, callback) {
    var data = newData;
    var buf = Buffer.from(data);
    var buf2 = Buffer.allocUnsafe(buf.length);
    buf2.fill(data, 0);

    zk.setData(nodePath, buf2, -1, function (error, stat) {
        if (error) {
            console.log(error.stack);
            callback("2")
            return;
        }

        console.log('Data is set.');
        callback("1");
    });
}

function deleteNode(zk, nodePath, callback) {
    zk.removeRecursive(nodePath, -1, function (error) {
        if (error) {
            console.log(error.stack);
            callback("2");
            return;
        }

        console.log('Nodes removed.');
        callback("1");
    });
}

function createNode(zk, nodePath, nodeValue, callback) {
    zk.create(
        nodePath,
        Buffer.from(nodeValue),
        function (error, path) {
            if (error) {
                console.log(error.stack);
                callback("2")
                return;
            }

            console.log('Node: %s is created.', path);
            callback("1")
        }
    );
}

export default {
    connectZK,
    getNodeData,
    connectZKByName,
    testZKAccess,
    operateZKNode,
    getChildren
}
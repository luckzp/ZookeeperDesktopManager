import dayjs from "dayjs";
var zkClientMap = new Map()
var zkClient
var Zookeeper = require('node-zookeeper-client')
var OPTIONS = {
  sessionTimeout: 300000
}

function connectZK (callback) {
  var connects = localStorage.getItem('zkNames')
  if (connects != null && connects != '') {
    if (connects.indexOf('$') == -1) {
      connectZKByName(connects, callback)
    } else {
      connects.split('$').forEach(element => {
        console.log('split zk address is ', element)
        if (element != null && element != '') {
          var zk = zkClientMap.get(element)
          if (zk == undefined) {
            zk = Zookeeper.createClient(element, OPTIONS)
            zkClientMap.set(element, zk)
            zk.connect()
          } else {
            console.log(element + ' lin2 connected zk:', zk)
            getTree(zk, element, element, callback)
          }
          zk.on('connected', function () {
            console.log(element + ' lin connected zk:', zk)
            getTree(zk, element, element, callback)
          })
        }
      })
    }
  }
}

function getTree (zk, lableName, zkName, callback) {
  const newChild = { label: lableName, children: [], path: '/', zkName: zkName }
  if (localStorage.getItem('loadMode') == '1') {
    zk.listSubTreeBFS('/', function (error, children) {
      if (error) {
        console.log(error.stack)
        return
      }
      var parentChild = newChild
      // console.log('Children are:', children);
      children.forEach(childPath => {
        parentChild = newChild
        // console.log('nweChild is: ', newChild)
        var len = childPath.split('/').length
        // console.log('childPath is: ', childPath, len)
        var templen = 0
        childPath.split('/').forEach(e => {
          templen++
          if (e != null && e != '') {
            var flag = false
            var index = 0
            // console.log('splited childPath is: ', childPath, e)
            parentChild.children.forEach((c, i) => {
              if (c.label == e) {
                flag = true
                index = i
              }
            })
            // console.log('flag ', flag, parentChild.children)
            if (!flag) { // 数组不包含该元素
              console.log('不包含元素', e, childPath)
              var temp = { label: e, children: [], path: childPath, zkName: zkName }
              var i = parentChild.children.push(temp)
              parentChild = parentChild.children[i - 1]
            } else { // 数组包含该元素
              console.log('包含元素', e, childPath)
              if (parentChild.children != null && parentChild.children.length > 0) {
                parentChild = parentChild.children[index]
                console.log(parentChild)
              }
            }
          }
        })
      })
      callback(newChild)
    })
  } else {
    callback(newChild)
  }
}

function connectZKByName (zkName, callback) {
  var CONNECTION_STRING = zkName
  var zk = zkClientMap.get(zkName)
  if (zk == null) {
    zk = Zookeeper.createClient(CONNECTION_STRING, OPTIONS)
    zkClientMap.set(CONNECTION_STRING, zk)
    zk.connect()
    zk.on('connected', function () {
      console.log('connectZKByName connected zk:', zk)
      // getTree(zk, CONNECTION_STRING, CONNECTION_STRING, callback)
    })
  } else {
    console.log('connectZKByName connected zk:', zk)
    // getTree(zk, CONNECTION_STRING, CONNECTION_STRING, callback)
  }
  zkClient = zk
  return zk
}

function getChildren (path) {
  var nodes = []
  zkClient.getChildren(path, function (error, children, stats) {
    if (error) {
      console.log(error.stack)
      return
    }
    console.log('zk node get stat=%s',  stats);
    children.forEach((element) => {
      var childPath = path == '/' ? path + element : path + '/' + element
      const child = { label: element, path: childPath }
      nodes.push(child)
    })
  })
  return nodes
}

function exists (client, path) {
  client.exists(path, function (error, stat) {
    if (error) {
      console.log(error.stack)
      return false
    }

    if (stat) {
      console.log('Node exists.')
      return true
    } else {
      console.log('Node does not exist.')
      return false
    }
  })
}

function getNodeData (path, callback) {

    zkClient.getData(
      path,
      function (event) {
        console.log('Got event: %s.', event)
      },
      function (error, data, stat) {
        if (error) {
          console.log(error.stack)
          return
        }
        var node = extracted(stat, data)
        callback(node);
      }
    )
  }


function operateZKNode (operation, zkName, nodePath, newData, callback) {
  var zk = zkClientMap.get(zkName)
  if (zk == undefined) {
    zk = Zookeeper.createClient(zkName, OPTIONS)
    zkClientMap.set(zkName, zk)
    zk.connect()
  } else {
    if (operation == 'setData') {
      setNodeData(zk, nodePath, newData, callback)
    }
    if (operation == 'deleteNode') {
      deleteNode(zk, nodePath, callback)
    }
    if (operation == 'createNode') {
      createNode(zk, nodePath, newData, callback)
    }
  }
  zk.on('connected', function () {
    if (operation == 'setData') {
      setNodeData(zk, nodePath, newData, callback)
    }
    if (operation == 'deleteNode') {
      deleteNode(zk, nodePath, callback)
    }
    if (operation == 'createNode') {
      createNode(zk, nodePath, newData, callback)
    }
  })
}

function setNodeData (zk, nodePath, newData, callback) {
  var data = newData
  var buf = Buffer.from(data)
  var buf2 = Buffer.allocUnsafe(buf.length)
  buf2.fill(data, 0)

  zk.setData(nodePath, buf2, -1, function (error, stat) {
    if (error) {
      console.log(error.stack)
      callback('2')
      return
    }

    console.log('Data is set.')
    callback('1')
  })
}

function deleteNode (zk, nodePath, callback) {
  zk.removeRecursive(nodePath, -1, function (error) {
    if (error) {
      console.log(error.stack)
      callback('2')
      return
    }

    console.log('Nodes removed.')
    callback('1')
  })
}

function createNode (zk, nodePath, nodeValue, callback) {
  zk.create(
    nodePath,
    Buffer.from(nodeValue),
    function (error, path) {
      if (error) {
        console.log(error.stack)
        callback('2')
        return
      }

      console.log('Node: %s is created.', path)
      callback('1')
    }
  )
}

const hexString = (longBuffer) => (longBuffer).toString("hex");

const int64 = (longBuffer) => parseInt(hexString(longBuffer), 16);

const format = (inp) =>
  dayjs(inp).format("YYYY-MM-DD HH:mm:ss");
  
function extracted (stat, data)  {
  return [
    {
      name: "cZxid",
      description: "当前会话事务创建产生ID",
      value: int64(stat.czxid),
      realValue: `0x${hexString(stat.czxid).replace(/0+/, "")}`,
    },
    {
      name: "ctime",
      description: "创建时间",
      value: format(int64(stat.ctime)),
      realValue: format(int64(stat.mtime)),
    },
    {
      name: "mZxid",
      description: "最近更新节点的事务ID",
      value: int64(stat.mzxid),
      realValue: `0x${hexString(stat.mzxid).replace(/0+/, "")}`,
    },
    {
      name: "mtime",
      description: "最近修改时间",
      value: format(int64(stat.mtime)),
      realValue: format(int64(stat.mtime)),
    },
    {
      name: "pZxid",
      description: "子节点最后修改的事务ID",
      value: int64(stat.pzxid),
      realValue: `0x${hexString(stat.pzxid).replace(/0+/, "")}`,
    },
    {
      name: "cversion",
      description: "子节点的版本号",
      value: stat.cversion,
      realValue: stat.cversion,
    },
    {
      name: "dataVersion",
      description: "数据的版本号",
      value: stat.version,
      realValue: stat.version,
    },
    {
      name: "aclVersion",
      description: "acl的版本号",
      value: stat.aversion,
      realValue: stat.aversion,
    },
    {
      name: "ephemeralOwner",
      description: "创建此临时节点的会话ID",
      value: int64(stat.ephemeralOwner),
      realValue: `0x${
        int64(stat.ephemeralOwner) != 0
          ? hexString(stat.ephemeralOwner).replace(/0+/, "")
          : 0
      }`,
    },
    // {
    //   name: "dataLength",
    //   description: "数据长度",
    //   value: stat.dataLength,
    //   realValue: stat.dataLength,
    // },
    {
      name: "numChildren",
      description: "子节点的个数",
      value: stat.numChildren,
      realValue: stat.numChildren,
    },
  ];
}

export default {
  connectZK,
  getNodeData,
  connectZKByName,
  operateZKNode,
  getChildren
}

<template>
  <div class="graphContainer" id="graphContainer">
    <GraphInfo v-bind:graph='graph' :mode_name='mode_name' :analyzedProperties='analyzedProperties'/>
    <!-- <OperationList v-show="mode_name === '力导图模式'"/> -->
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'underscore'
import * as d3 from 'd3'
import GraphInfo from './GraphInfo.vue'
import OperationList from './OperationList.vue'
export default {
  name: 'GraphContainer',
  props: ['domain'],
  components: {
    GraphInfo,
    OperationList,
  },
  data () {
    return {
      graph: {
        nodes: [],
        links: [],
      },
      mode_name: '力导图模式',
      analyzedProperties: {},
      graphMode: true,
    }
  },
  mounted: function () {
    const graphContainer = d3.select('#graphContainer')
    this.svg = graphContainer.append('svg')
    this.svg.attr('width', '100%')
    this.svg.attr('height', '100%')
    this.simulation = d3.forceSimulation(this.graph.nodes)
      .force('link', d3.forceLink(this.graph.links).distance(d => Math.floor(Math.random() * 500) + 200).id(d => d.uuid))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('collide', d3.forceCollide())
      .force('center', d3.forceCenter(this.svg.width / 2, (this.svg.height - 200) / 2))
    this.linkGroup = this.svg.append('g').attr('class', 'link')
    this.linkTextGroup = this.svg.append('g').attr('class', 'linkText')
    this.linkMarkerGroup = this.svg.append('g').attr('class', 'linkMarker')
    this.nodeGroup = this.svg.append('g').attr('class', 'node')
    this.nodeTextGroup = this.svg.append('g').attr('class', 'nodeText')
    this.nodeButtonGroup = this.svg.append('g').attr('class', 'nodeButton')
    this.tooltip = this.svg.append('div').style('opacity', 0)
    this.svg.on('click', () => {
      d3.selectAll('.buttonGroup').classed('circle_operate', true)
    }, 'false')
  },
  methods: {
    changeDomain (name) {
      const _this = this
      $.ajax({
        data: {
          domain: name,
          nodeName: '',
          pageSize: 5,
        },
        type: 'POST',
        url: 'http://localhost:8081/get_domain_graph',
        success: function (result) {
          if (result.code === 200) {
            if (result.data !== null) {
              _this.graph.nodes = result.data.node
              _this.graph.links = result.data.relationship
              _this.updateGraph(_this.graphMode)
            }
          }
        }
      })
    },
    updateGraph (mode) {
      const _this = this
      const lks = this.graph.links
      let nodes = this.graph.nodes
      const links = []
      const filterList = []
      nodes.forEach(function (n) {
        if (filterList.indexOf(n.type) === -1) filterList.push(n.type)
      })
      _this.filterList = filterList
      const temp = _this.selectedFilterList
      if (typeof temp === 'undefined' || temp.length === 0) {
        _this.selectedFilterList = _this.deepClone(_this.filterList)
      }
      const sortNodes = _this.deepClone(nodes)
      const classifiedNodes = {}
      if (typeof _this.customSortOrderList === 'undefined' ||
        _this.customSortOrderList.length < _this.filterList.length) {
        sortNodes.forEach(function (n) {
          if (typeof classifiedNodes[n.type] === 'undefined') {
            classifiedNodes[n.type] = [n]
          } else {
            classifiedNodes[n.type].push(n)
          }
        })
      } else {
        for (const type of _this.customSortOrderList) {
          sortNodes.forEach(function (n) {
            if (n.type === type) {
              if (typeof classifiedNodes[n.type] === 'undefined') {
                classifiedNodes[n.type] = [n]
              } else {
                classifiedNodes[n.type].push(n)
              }
            }
          })
        }
        _this.filterList = _this.deepClone(_this.customSortOrderList)
      }
      const cateNum = Object.keys(classifiedNodes).length
      const rightContainer = document.getElementById('graphContainer')
      const leftMargin = 150
      let topMargin = 120
      const xSplit = rightContainer.offsetWidth / cateNum - 50
      const ySplit = 20
      let cnt = 0
      const res = []
      const analyzedProperties = []
      for (const c in classifiedNodes) {
        analyzedProperties.push({
          type: c,
          nodes_names: ''
        })
        topMargin += cnt * ySplit
        classifiedNodes[c].forEach(function (n) {
          n.x = n.fx = leftMargin + cnt * xSplit
          n.y = n.fy = topMargin + classifiedNodes[c].indexOf(n) * (100 - 0.6 * ySplit)
          res.push(n)
          analyzedProperties[_this.filterList.indexOf(c)].nodes_names += (n.name + ' ')
        })
        cnt += 1
      }
      _this.analyzedProperties = analyzedProperties
      if (!mode) {
        nodes = res
      }
      _this.updateNodeAndLink(nodes, lks, links)
      // 为每一个结点定制按钮组
      _this.addNodeButton()
      _this.updateLinkAttr(links)

      // 更新节点按钮组
      d3.selectAll('.nodeButton >g').remove()
      let nodeButton = _this.nodeButtonGroup.selectAll('.nodeButton').data(nodes, function (d) {
        return d
      })
      nodeButton.exit().remove()
      const nodeButtonEnter = _this.drawNodeButton(nodeButton)
      nodeButton = nodeButtonEnter.merge(nodeButton)

      // 更新节点
      let node = _this.nodeGroup.selectAll('circle').data(nodes, function (d) {
        return d.uuid
      })
      node.exit().remove()
      const nodeEnter = _this.drawNode(node)
      node = nodeEnter.merge(node).text(function (d) {
        return d.name // 这一行决定 circle 的 text 值，会在 html 中有，但是不会渲染
      })

      // 更新节点文字
      let nodeText = _this.nodeTextGroup.selectAll('text').data(nodes, function (d) {
        return d.uuid
      })
      nodeText.exit().remove()
      const nodeTextEnter = _this.drawNodeText(nodeText)
      nodeText = nodeTextEnter.merge(nodeText).text(function (d) {
        return d.name // 这一行觉得 nodeText 的渲染
      })

      // 更新连线 links
      // 要先把所有连线删了，不然选择出来的 link 中会含有上一张图谱的连线，导致后序一系列问题。
      // 删的时候注意，不能按index从小到大删，会出现删不干净的情况
      while (document.getElementsByClassName('link')[0].children.length > 0) {
        document.getElementsByClassName('link')[0].children[0].remove()
      }
      let link = _this.linkGroup.selectAll('.link >path').data(links, function (d) {
        return d.uuid
      })
      link.exit().remove()
      const linkEnter = _this.drawLink(link)
      link = linkEnter.merge(link)

      // 更新连线文字
      _this.linkTextGroup.selectAll('text').data(links, function (d) {
        return d.uuid
      }).exit().remove() // 移除多余的text dom
      let linkText = _this.linkTextGroup.selectAll('text >textPath').data(links, function (d) {
        return d.uuid
      })
      linkText.exit().remove()
      const linkTextEnter = _this.drawLinkText(linkText)
      linkText = linkTextEnter.merge(linkText).text(function (d) {
        return d.lk.name
      })

      // 更新 Marker
      while (document.getElementsByClassName('linkMarker')[0].children.length > 0) {
        document.getElementsByClassName('linkMarker')[0].children[0].remove()
      }
      _this.linkMarkerGroup.selectAll('.linkMarker>marker').data(links, function (d) {
        return d.uuid
      }).exit().remove() // 移除多余的 marker
      let linkMarker = _this.linkMarkerGroup.selectAll('marker>path').data(links, function (d) {
        return d.uuid
      })
      linkMarker.exit().remove()
      const linkMarkerEnter = _this.drawLinkMarker(linkMarker)
      linkMarker = linkMarkerEnter.merge(linkMarker)
      _this.addD3ToNodes(nodes, links, node, link, nodeButton, nodeText)
      _this.addZoomToNodes()
    },
    deepClone (obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    updateNodeAndLink (nodes, lks, links) {
      // 由后端传过来的节点坐标，固定节点，由于是字符串，需要转换
      nodes.forEach(function (n) {
        if (typeof (n.fx) === 'undefined' || n.fx === '' || n.fx == null) {
          n.fx = null
        }
        if (typeof (n.fy) === 'undefined' || n.fy === '' || n.fy == null) {
          n.fy = null
        }
        if ((typeof n.fx) === 'string') n.fx = parseFloat(n.fx)
        if ((typeof n.fy) === 'string') n.fy = parseFloat(n.fy)
      })
      lks.forEach(function (m) {
        const sourceNode = nodes.filter(function (n) {
          return n.uuid === m.sourceid
        })[0]
        if (typeof (sourceNode) === 'undefined') return
        const targetNode = nodes.filter(function (n) {
          return n.uuid === m.targetid
        })[0]
        if (typeof (targetNode) === 'undefined') return
        links.push({ source: sourceNode.uuid, target: targetNode.uuid, lk: m })
      })
    },
    addNodeButton () {
      // 先删除所有为节点自定义的按钮组
      d3.selectAll('svg >defs').remove()
      let nodes = this.graph.nodes
      let database = [1, 1, 1, 1, 1]
      let pie = d3.pie()
      let pieData = pie(database)
      let nodeButton = this.svg.append('defs')
      nodes.forEach(function (m) {
        let nodeBtnGroup = nodeButton.append('g')
          .attr('id', 'out_circle' + m.uuid) // 为每一个节点定制一个按钮组，在画按钮组的时候为其指定该id
        let buttonEnter = nodeBtnGroup.selectAll('.buttonGroup')
          .data(pieData)
          .enter()
          .append('g')
          .attr('class', function (d, i) {
            return 'action_' + i
          })
        let defaultR = 30
        if (typeof (m.r) === 'undefined') {
          m.r = defaultR
        }
        let arc = d3.arc()
          .innerRadius(m.r)
          .outerRadius(m.r + 30)
        buttonEnter.append('path')
          .attr('d', function (d) {
            return arc(d)
          })
          .attr('fill', '#D2D5DA')
          .style('opacity', 0.6)
          .attr('stroke', '#f0f0f4')
          .attr('stroke-width', 2)
        buttonEnter.append('text')
          .attr('transform', function (d, i) {
            return 'translate(' + arc.centroid(d) + ')'
          })
          .attr('text-anchor', 'middle')
          .text(function (d, i) {
            let zi = []
            zi[0] = '编辑'
            zi[1] = '展开'
            zi[2] = '追加'
            zi[3] = '连线'
            zi[4] = '删除'
            return zi[i]
          })
          .attr('font-size', 10)
          .attr('cursor', 'pointer')
      })
    },
    updateLinkAttr (links) {
      if (links.length > 0) {
        _.each(links, function (link) {
          let same = _.where(links, {
            source: link.source,
            target: link.target
          })
          let sameAlt = _.where(links, {
            source: link.target,
            target: link.source
          })
          let sameAll = same.concat(sameAlt)
          _.each(sameAll, function (s, i) {
            s.sameIndex = (i + 1)
            s.sameTotal = sameAll.length
            s.sameTotalHalf = (s.sameTotal / 2)
            s.sameUneven = ((s.sameTotal % 2) !== 0)
            s.sameMiddleLink = ((s.sameUneven === true) && (Math.ceil(s.sameTotalHalf) === s.sameIndex))
            s.sameLowerHalf = (s.sameIndex <= s.sameTotalHalf)
            s.sameArcDirection = 1
            // s.sameArcDirection = s.sameLowerHalf ? 0 : 1
            s.sameIndexCorrected = s.sameLowerHalf ? s.sameIndex : (s.sameIndex - Math.ceil(s.sameTotalHalf))
          })
        })
        let maxSame = _.chain(links)
          .sortBy(function (x) {
            return x.sameTotal
          })
          .last()
          .value().sameTotal

        _.each(links, function (link) {
          link.maxSameHalf = Math.round(maxSame / 2)
        })
      }
    },
    drawNodeButton (nodeButton) {
      return nodeButton.enter().append('g').append('use')//  为每个节点组添加一个 use 子元素
        .attr('r', function (d) {
          return d.r
        })
        .attr('xlink:href', function (d) {
          return '#out_circle' + d.uuid
        }) //  指定 use 引用的内容
        .attr('class', function (d, i) {
          return 'buttonGroup out_buttonGroup_' + d.uuid
        })
        .classed('circle_operate', true)
    },
    drawNode (node) {
      let _this = this
      let nodeEnter = node.enter().append('circle')
      // 结点半径
      node.attr('r', function (d) {
        if (typeof (d.r) !== 'undefined' && d.r !== '') { // 有定义。不是空
          return d.r
        }
        return 30
      }).attr('fill', function (d) {
        if (typeof (d.url) !== 'undefined' && d.url.length !== 0) return 'url(#' + 'pattern' + d.uuid + ')'
        if (typeof (d.color) !== 'undefined' && d.color !== '') {
          return d.color
        }
        return '#483d8b'
      }).attr('type', function (d) {
        return d.type
      })
      node.style('stroke', function (d) {
        if (typeof (d.color) !== 'undefined' && d.color !== '') {
          return d.color
        }
        return '#fdfbfb'
      }).style('stroke-opacity', function (d) {
        if (typeof (d.url) !== 'undefined' && d.url.length !== 0) {
          return 0
        }
        return 1
      })

      // 结点半径
      nodeEnter.attr('r', function (d) {
        if (typeof (d.r) !== 'undefined' && d.r !== '') { // 有定义。不是空
          return d.r
        }
        return 30
      }).attr('type', function (d) {
        return d.type
      })
      // 节点图片
      let pattern = _this.nodeGroup.selectAll('pattern').data(_this.graph.nodes, function (d) {
        return 'pattern' + d.uuid
      })
      pattern
        .enter()
        .append('pattern')
        .attr('id', function (d) {
          return 'pattern' + d.uuid
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 64)
        .attr('width', 64)
        .append('svg:image')
      _this.nodeGroup
        .selectAll('image')
        .data(_this.graph.nodes, function (d) {
          return 'pattern-image' + d.uuid
        })
        .attr('xlink:href', function (d) {
          return d.url
        }
        )
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', function (d) {
          return d.r * 2
        })
        .attr('width', function (d) {
          return d.r * 2
        })

      // 结点颜色
      nodeEnter.attr('fill', function (d) {
        if (typeof (d.url) !== 'undefined' && d.url.length !== 0) return 'url(#' + 'pattern' + d.uuid + ')'
        if (typeof (d.color) !== 'undefined' && d.color !== '') {
          return d.color
        }
        return '#483d8b'
      }).attr('id', function (d) {
        return d.uuid
      })
      nodeEnter.style('opacity', 0.99)
      nodeEnter.style('stroke', function (d) {
        if (typeof (d.color) !== 'undefined' && d.color !== '') {
          return d.color
        }
        return '#483d8b'
      })
        .style('stroke-opacity', function (d) {
          if (typeof (d.url) !== 'undefined' && d.url.length !== 0) {
            return 0
          }
          return 1
        })

      // nodeEnter.append('title')// 为每个节点设置title
      //     .text(function (d) {
      //         return d.name
      //     })
      nodeEnter.on('mouseover', function (d, i) {
        _this.nodeDetail = d
        _this.timer = setTimeout(function () {
          d3.select('#richContainer')
            .style('position', 'absolute')
            .style('left', d.x + 'px')
            .style('top', d.y + 'px')
            .style('display', 'block')
          _this.editorContent = ''
          _this.showImageList = []
          // _this.getNodeDetail(d.uuid)
        }, 2000)
      })
      nodeEnter.on('mouseout', function (d, i) {
        clearTimeout(_this.timer)
      })
      nodeEnter.on('dblclick', function (d) {
        _this.addNodeProperty(d)// 双击更新节点名称
      })
      nodeEnter.on('mouseenter', function (d) {
        let aa = d3.select(this)._groups[0][0]
        if (aa.classList.contains('selected')) return
        d3.select(this).style('stroke-width', '6')
      })
      nodeEnter.on('mouseleave', function (d) {
        let aa = d3.select(this)._groups[0][0]
        if (aa.classList.contains('selected')) return
        d3.select(this).style('stroke-width', '2')
      })
      nodeEnter.on('click', function (event, d) {
        d3.select('#nodeDetail').style('display', 'block')
        // 其他结点的外圈全部隐藏
        _this.svg.selectAll('.buttonGroup').classed('circle_operate', true)
        // 被点击结点的外圈打开
        // 关系 index = d.index
        _this.svg.selectAll('.out_buttonGroup_' + d.uuid).classed('circle_operate', false)
        _this.graphEntity = d
        _this.selectNodeId = d.uuid
        _this.selectnodename = d.name
        // 如果当前状态为添加关系状态
        if (_this.isAddLink) {
          _this.selectTargetNodeId = d.uuid
          if (_this.selectSourceNodeId === _this.selectTargetNodeId || _this.selectSourceNodeId === 0 || _this.selectTargetNodeId === 0) return
          _this.createLink(_this.selectSourceNodeId, _this.selectTargetNodeId, 'RE')
          _this.selectSourceNodeId = 0
          _this.selectTargetNodeId = 0
          d.fixed = false
          event.stopPropagation()
        }
      })
      nodeEnter.call(d3.drag()
        .on('start', _this.dragStarted)
        .on('drag', _this.dragged)
        .on('end', _this.dragEnded))
      return nodeEnter
    },
    dragStarted (event, d) {
      if (!event.active) this.simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
      d.fixed = true
    },
    dragged (event, d) {
      d.fx = event.x
      d.fy = event.y
    },
    dragEnded (event, d) {
      if (!event.active) this.simulation.alphaTarget(0)
      d.fx = event.x
      d.fy = event.y
      let domain = this.domain
      let uuid = d.uuid
      let fx = d.fx
      let fy = d.fy
      let ajaxData = { domain: domain, uuid: uuid, fx: fx, fy: fy }
      $.ajax({
        data: ajaxData,
        type: 'POST',
        url: 'http://localhost:8081/update_coordinate_of_node',
        success: function (result) {
          if (result.code === 200) {
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          alert(errorThrown)
        }
      })
    },
    drawNodeText (nodeText) {
      let _this = this
      let nodeTextEnter = nodeText.enter().append('text')
        .style('fill', '#fff')
        .style('font-size', function (d) {
          if (d.fontSize !== null) { return d.fontSize }
          return 16
        })
        .attr('dy', 4)
        .attr('font-family', '微软雅黑')
        .attr('text-anchor', 'middle')
        .text(function (d) {
          // 这段代码不会影响结点名称的渲染，故注释掉
          // if (typeof (d.name) === 'undefined') return '';
          // if (d.name.length > 4) {
          //     console.log('new node text: ', d.name);
          //     return '太长了名字'
          // }
          // return d.name;
        })
      nodeText.style('font-size', function (d) {
        return d.fontSize
      })
      nodeTextEnter.on('mouseover', function (d, i) {
        _this.timer = setTimeout(function () {
          d3.select('#richContainer')
            .style('position', 'absolute')
            .style('left', d.x + 'px')
            .style('top', d.y + 'px')
            .style('display', 'block')
          _this.editorContent = ''
          _this.showImageList = []
          // _this.getNodeDetail(d.uuid);
        }, 3000)
      })
      nodeTextEnter.on('click', function (event, d) {
        $('#link_menubar').hide()// 隐藏空白处右键菜单
        _this.graphEntity = d
        _this.selectNodeId = d.uuid
        // 更新工具栏节点信息
        _this.getCurrentNodeInfo(d)
        // 添加连线状态
        if (_this.isAddLink) {
          _this.selectTargetNodeId = d.uuid
          if (_this.selectSourceNodeId === _this.selectTargetNodeId || _this.selectSourceNodeId === 0 || _this.selectTargetNodeId === 0) return
          _this.createLink(_this.selectSourceNodeId, _this.selectTargetNodeId, 'RE')
          _this.selectSourceNodeId = 0
          _this.selectTargetNodeId = 0
          d.fixed = false
          event.stopPropagation()
        }
      })

      return nodeTextEnter
    },
    drawLink (link) {
      let _this = this
      let linkEnter = link.enter().append('path')
        .attr('stroke-width', 2)
        .attr('stroke', '#fff')
        .attr('fill', 'none')
        .attr('id', function (d) {
          return 'invis_' + d.lk.sourceid + '-' + d.lk.name + '-' + d.lk.targetid
        })
        .attr('marker-end', function (d) {
          return `url(#arrow${d.lk.sourceid}-${d.lk.targetid})`
        })
        .attr('class', function (d) {
          let sourceName, targetName
          for (let node of _this.graph.nodes) {
            if (node.uuid === d.lk.sourceid) {
              sourceName = node.name
            } else if (node.uuid === d.lk.targetid) {
              targetName = node.name
            }
          }
          return sourceName + '-' + targetName
        })
      linkEnter.on('dblclick', function (d) {
        // _this.selectNodeId = d.lk.uuid;
        // if (_this.isdeletelink) {
        //     _this.deletelink();
        // } else {
        // 双击连续更新关系名称
        _this.updateLinkName(d)
        // }
      })
      linkEnter.on('click', function (d) {
        if (_this.isDeleteLink) {
          _this.selectLinkId = d.lk.uuid
          _this.deleteLink()
        }
      })
      linkEnter.on('contextmenu', function (event, d) {
        let cc = $(this).offset()
        _this.selectNodeId = d.lk.uuid
        _this.selectlinkname = d.lk.name
        d3.select('#link_menubar')
          .style('position', 'absolute')
          .style('left', cc.left + 'px')
          .style('top', cc.top + 'px')
          .style('display', 'block')
        event.preventDefault()// 禁止系统默认右键
        event.stopPropagation()// 禁止空白处右键
      })
      linkEnter.on('mouseenter', function (d) {
        // d3.select(this).style('stroke-width', '6').style('cursor', 'pointer').attr('stroke', '#ff9e9e').attr('marker-end', 'url(#arrow)');
        // _this.nodeDetail = d.lk;
        // d3.select('#nodeDetail').style('display', 'block');
        d3.select(this).style('cursor', 'pointer')
      })
      linkEnter.on('mouseleave', function (d) {
        // d3.select(this).style('stroke-width', '1').attr('stroke', '#fce6d4').attr('marker-end', 'url(#arrow)');

      })
      return linkEnter
    },
    drawLinkText (link) {
      const _this = this
      let linkTextEnter = link.enter().append('text')
        .style('fill', '#fff')
        .append('textPath')
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .attr('xlink:href', function (d) {
          return '#invis_' + d.lk.sourceid + '-' + d.lk.name + '-' + d.lk.targetid
        })
        .style('font-size', function (d) {
          return d.lk.fontSize
        })
        .text(function (d) {
          // 这段代码不会印象 linkText 的渲染
          // if (d.lk.name !== '') {
          //     return d.lk.name;
          // }
        })
      link.attr('xlink:href', function (d) {
        return '#invis_' + d.lk.sourceid + '-' + d.lk.name + '-' + d.lk.targetid
      })
      link.style('font-size', function (d) {
        return d.lk.fontSize
      })
      linkTextEnter.on('mouseover', function (d) {
        _this.selectNodeId = d.lk.uuid
        _this.selectlinkname = d.lk.name
        let cc = $(this).offset()
        d3.select('#link_menubar')
          .style('position', 'absolute')
          .style('left', cc.left + 'px')
          .style('top', cc.top + 'px')
          .style('display', 'block')
      })

      return linkTextEnter
    },
    drawLinkMarker (link) {
      return link.enter().append('marker')
        .attr('id', function (d) {
          return `arrow${d.lk.sourceid}-${d.lk.targetid}`
        })
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', '20')
        .attr('markerHeight', '20') // 20 就是箭头长度
        .attr('viewBox', '0 -10 20 20')
        .attr('refX', function (d) {
          let radius = '30'
          let circles = document.getElementsByClassName('node')[0].children
          for (let circle of circles) {
            if (circle.getAttribute('id') === d.lk.targetid) {
              radius = circle.getAttribute('r')
              break
            }
          }
          let res = String(parseInt(radius) + 20)
          return String(res)
        }) // 半径 r + 20
        .attr('refY', '0')
        .attr('orient', 'auto')
        .append('path').attr('d', 'M0,-7 L20,0 L0,7').attr('fill', '#fff')
    },
    addD3ToNodes (nodes, links, node, link, nodeButton, nodeText) {
      let _this = this
      _this.simulation.nodes(nodes).on('tick', ticked)
      _this.simulation.force('link').links(links)
      _this.simulation.alphaTarget(1).restart()

      function linkArc (d) {
        let dx = (d.target.x - d.source.x)
        let dy = (d.target.y - d.source.y)
        let dr = Math.sqrt(dx * dx + dy * dy)
        let unevenCorrection = (d.sameUneven ? 0 : 0.5)
        let curvature = 2
        let arc = (1.0 / curvature) * ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection))
        if (d.sameMiddleLink) {
          arc = 0
        }
        return 'M' + d.source.x + ',' + d.source.y + 'A' + arc + ',' + arc + ' 0 0,' + d.sameArcDirection + ' ' + d.target.x + ',' + d.target.y
      }

      function ticked () {
        link.attr('d', linkArc)
        // 更新节点坐标
        node.attr('cx', d => d.x ? d.x : 0)
          .attr('cy', d => d.y ? d.y : 0)
        // 更新节点操作按钮组坐标
        nodeButton.attr('cx', function (d) {
          return d.x
        })
          .attr('cy', function (d) {
            return d.y
          })
        nodeButton.attr('transform', (d) => d.x && d.y
          ? `translate(${d.x}, ${d.y}) scale(1)`
          : 'translate(0, 0) scale(1)'
        )

        // 更新文字坐标
        nodeText.attr('x', d => d.x ? d.x : 0)
          .attr('y', d => d.y ? d.y : 0)
      }
    },
    addZoomToNodes () {
      let _this = this
      _this.svg.call(d3.zoom().on('zoom', function (event) {
        d3.select('#link_menubar').style('display', 'none')
        d3.select('#nodeDetail').style('display', 'none')
        d3.selectAll('.node').attr('transform', event.transform)
        d3.selectAll('.nodeText').attr('transform', event.transform)
        d3.selectAll('.link').attr('transform', event.transform)
        d3.selectAll('.linkText').attr('transform', event.transform)
        d3.selectAll('.nodeButton').attr('transform', event.transform)
      }))
      _this.svg.on('dblclick.zoom', null) // 静止双击缩放
      // 按钮组事件
      _this.svg.selectAll('.buttonGroup').on('click', function (d, i) {
        if (_this.nodeButtonAction) {
          switch (_this.nodeButtonAction) {
            case 'EDIT':
              _this.isedit = true
              _this.propactiveName = 'propedit'
              _this.txx = d.x
              _this.tyy = d.y
              _this.addNodeProperty(d)
              break
            case 'MORE':
              _this.getMoreNode()
              break
            case 'CHILD':
              _this.operatetype = 2
              _this.isbatchcreate = true
              _this.isedit = false
              break
            case 'LINK':
              _this.isAddLink = true // 切换为添加连线状态
              _this.selectSourceNodeId = d.uuid
              break
            case 'DELETE': {
              _this.selectNodeId = d.uuid
              let outButtonGroupId = '.out_buttonGroup_' + d.uuid
              _this.deleteNode(outButtonGroupId)
              break
            }
          }
          // ACTION = ''// 重置 ACTION
        }
      })
      // 按钮组事件绑定
      _this.svg.selectAll('.action_0').on('click', function (d) {
        _this.nodeButtonAction = 'EDIT'
      })
      _this.svg.selectAll('.action_1').on('click', function (d) {
        _this.nodeButtonAction = 'MORE'
      })
      _this.svg.selectAll('.action_2').on('click', function (d) {
        _this.nodeButtonAction = 'CHILD'
      })
      _this.svg.selectAll('.action_3').on('click', function (d) {
        _this.nodeButtonAction = 'LINK'
      })
      _this.svg.selectAll('.action_4').on('click', function (d) {
        _this.nodeButtonAction = 'DELETE'
      })
    },
  }
}
</script>

<style>
#graphContainer {
  width: 100%;
  height: 100%;
}
.circle_operate {
  display: none;
}
circle {
  cursor: pointer;
}
</style>

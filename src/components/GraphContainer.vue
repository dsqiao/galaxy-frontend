<template>
  <div
    class="graphContainer"
    id="graphContainer"
    :style="this.$store.state.createNodeMode && 'cursor: crosshair;'"
  >
    <GraphInfo
      v-bind:graph="graph"
      :mode_name="mode_name"
      :domain="domain"
      :analyzedProperties="analyzedProperties"
    />
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'underscore'
import * as d3 from 'd3'
import GraphInfo from './GraphInfo.vue'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'GraphContainer',
  props: {
    domain: {
      type: String,
    },
    createLinkMode: {
      type: Boolean,
      default: false,
    },
    graphMode: {
      type: Boolean,
      default: true,
    }
  },
  components: {
    GraphInfo,
  },
  watch: {
    graphMode: function (newVal, oldVal) {
      this.updateGraph(newVal)
    }
  },
  computed: {
    ...mapState(['isEditingNodeAttr'])
  },
  data () {
    return {
      graph: {
        nodes: [],
        links: [],
      },
      mode_name: '力导图模式',
      analyzedProperties: {},
    }
  },
  mounted: function () {
    const graphContainer = d3.select('#graphContainer')
    this.svg = graphContainer.append('svg')
    this.svg.attr('width', '100%')
    this.svg.attr('height', '100%')
    this.linkGroup = this.svg.append('g').attr('class', 'link')
    this.linkTextGroup = this.svg.append('g').attr('class', 'linkText')
    this.linkMarkerGroup = this.svg.append('g').attr('class', 'linkMarker')
    this.nodeGroup = this.svg.append('g').attr('class', 'node')
    this.nodeTextGroup = this.svg.append('g').attr('class', 'nodeText')
    this.nodeButtonGroup = this.svg.append('g').attr('class', 'nodeButton')
    this.svg.on('click', (event) => {
      if (event.srcElement.tagName !== 'circle') {
        // 点的不是 node ，隐藏所有 btnGroup
        d3.selectAll('.buttonGroup').classed('circle_operate', true)
          .transition()
          .style('opacity', 0)
          .on('end', function () {
            d3.select(this).style('display', 'none')
          })
      }
    }, 'false')
    document.getElementById('graphContainer').addEventListener('click', (event) => {
      if (this.$store.state.createNodeMode) {
        this.setCreateNodeMode(false)
        this.txx = event.offsetX
        this.tyy = event.offsetY
        this.createSingleNode()
      }
    })
  },
  methods: {
    ...mapMutations([
      'switchIsEditingNodeAttr',
      'switchIsEditingLinkAttr',
      'setNodeAttr',
      'setCreateNodeMode',
    ]),
    changeDomain (name) {
      const _this = this
      $.ajax({
        // pageSize 记录最多返回结点个数
        data: {
          domain: name,
          nodeName: '',
          pageSize: 500,
        },
        type: 'POST',
        url: 'http://localhost:8081/get_domain_graph',
        success: function (result) {
          if (result.code === 200) {
            if (result.data !== null) {
              _this.graph.nodes = result.data.node
              _this.graph.links = result.data.relationship
              _this.$emit('setGraph', _this.graph.nodes, _this.graph.links)
              _this.updateGraph(_this.graphMode)
            }
          }
        }
      })
    },
    updateGraph (mode) { // 初始化渲染图谱
      const _this = this
      const lks = this.graph.links
      let nodes = this.graph.nodes
      const links = []

      if (!mode) {
        const filterList = [] // 存所有种类
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

        nodes = res
      }
      this.updateNodeAndLink(nodes, lks, links)
      // 为每一个结点定制按钮组，nodeButton 就是每个点四周那一圈，位置是在 svg>defs，不会显示
      this.addNodeButton()
      this.updateLinkAttr(links)
      console.log(lks)

      // 画结点
      {
        for (let i of nodes) {
          delete i.fx
          delete i.fy
        }
        const cleanNodes = JSON.parse(JSON.stringify(nodes)).map(d => Object.create(d))
        // console.log(cleanLinks)
        const graphWidth = parseInt(this.svg.style('width').slice(0, -2))
        const graphHeight = parseInt(this.svg.style('height').slice(0, -2))
        let simulation = d3.forceSimulation().nodes(cleanNodes)
          .force('charge', d3.forceManyBody().strength(-100))
          .force('link', d3.forceLink(links).distance(d => 180).id(d => d.uuid))
          .force('center', d3.forceCenter(graphWidth / 2, graphHeight / 2))
        // const myLink = this.linkGroup
        //   .selectAll('path')
        //   .data(links)
        //   .join('path')
        //   .attr('stroke-width', 2)
        //   .attr('stroke', '#fff')
        //   .attr('fill', '#fff')
        //   .attr('id', d => `invis_${d.lk.sourceid}-${d.lk.name}-${d.lk.targetid}`)
        //   .attr('marker-end', d => `url(#arrow${d.lk.sourceid}-${d.lk.targetid})`)
        //   .attr('class', function (d) {
        //     let sourceName, targetName
        //     for (let node of _this.graph.nodes) {
        //       if (node.uuid === d.lk.sourceid) {
        //         sourceName = node.name
        //       } else if (node.uuid === d.lk.targetid) {
        //         targetName = node.name
        //       }
        //     }
        //   })
        const myNode = this.nodeGroup
          .selectAll('circle')
          .data(cleanNodes)
          .join('circle')
          .attr('r', d => d.r)
          .style('stroke', d => d.color)
          .style('stroke-width', '2')
          .attr('fill', d => d.color)
          .attr('id', d => d.uuid)
          .on('dblclick', function (event, d) { // d3 api 改了，多传了个 event 作为第一个参数
            _this.updateNodeProperty(d)
          })
          .on('mouseenter', function (d) {
            // let aa = d3.select(this)._groups[0][0]
            // if (aa.classList.contains('selected')) return
            d3.select(this)
              .transition()
              .style('stroke-width', '7')
          })
          .on('mouseleave', function (d) {
            // let aa = d3.select(this)._groups[0][0]
            // if (aa.classList.contains('selected')) return
            d3.select(this)
              .transition()
              .style('stroke-width', '2')
          })
          .on('click', function (event, d) {
            const thisCircle = _this.svg.select('.out_buttonGroup_' + d.uuid) // 此次点击的 node 元素
            // 若 btnGroup 已经打开，则关闭它
            if (!thisCircle._groups[0][0].classList.contains('circle_operate')) {
              thisCircle.classed('circle_operate', true)
                .transition()
                .style('opacity', 0)
                .on('end', function () {
                  d3.select(this).style('display', 'none')
                })
              return
            }
            // 所有结点的外圈全部隐藏
            _this.svg.selectAll('.buttonGroup').classed('circle_operate', true)
              .transition()
              .style('opacity', 0)
              .on('end', function () {
                d3.select(this).style('display', 'none')
              })
            // 被点击结点的外圈打开
            thisCircle.classed('circle_operate', false)
              .style('display', 'block')
              .transition()
              .style('opacity', 1)
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
          .call(d3.drag()
            .on('start', (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', (event, d) => {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', (event, d) => {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
              // d.fx = event.x
              // d.fy = event.y
              // let domain = this.domain
              // let uuid = d.uuid
              // let fx = d.fx
              // let fy = d.fy
              // let ajaxData = { domain: domain, uuid: uuid, fx: fx, fy: fy }
              // $.ajax({
              //   data: ajaxData,
              //   type: 'POST',
              //   url: 'http://localhost:8081/update_coordinate_of_node',
              //   success: function (result) {
              //     if (result.code === 200) {
              //     }
              //   },
              //   error: function (XMLHttpRequest, textStatus, errorThrown) {
              //     alert(errorThrown)
              //   }
              // })
            })
          )

        // 更新节点文字
        const nodeText = this.nodeTextGroup
          .selectAll('text')
          .data(cleanNodes)
          .join('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('pointer-events', 'none')
          .style('font-size', d => d.fontSize)
          .style('fill', '#000')
          .text(d => d.name)

        // 更新结点四周按钮
        const nodeButton = this.nodeButtonGroup
          .selectAll('g')
          .data(cleanNodes)
          .join('g')
          .append('use')
          .attr('r', d => d.r)
          .attr('xlink:href', function (d) {
            return '#out_circle' + d.uuid
          }) //  指定 use 引用的内容
          .attr('class', function (d, i) {
            return 'buttonGroup out_buttonGroup_' + d.uuid
          })
          .style('opacity', 0)
          .style('display', 'none')
          .classed('circle_operate', true)

        simulation.on('tick', () => {
          // myLink
          //   .attr('d', d => {
          //     let dx = (d.target.x - d.source.x)
          //     let dy = (d.target.y - d.source.y)
          //     let dr = Math.sqrt(dx * dx + dy * dy)
          //     let unevenCorrection = (d.sameUneven ? 0 : 0.5)
          //     let curvature = 2
          //     let arc = (1.0 / curvature) * ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection))
          //     if (d.sameMiddleLink) {
          //       arc = 0
          //     }
          //     return 'M' + d.source.x + "," + d.source.y + "A" + arc + "," + arc + " 0 0," + d.sameArcDirection + " " + d.target.x + "," + d.target.y
          //   })
          nodeButton
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`)
          nodeText
            .attr('x', d => d.x)
            .attr('y', d => d.y)
          myNode
            .attr('cx', d => d.x) // 找不到 d.x，不是 undefinded, 而是 NaN
            .attr('cy', d => d.y)
        })
      }

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
      // _this.addD3ToNodes(node, links, node, link, nodeButton, nodeText)
      // _this.addZoomToNodes()
    },
    deepClone (obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    updateNodeAndLink (nodes, lks, links) {
      // 由后端传过来的节点坐标，固定节点，由于是字符串，需要转换
      // 刚create 的结点是有 fx 的，所以这个应该不会动到它
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
      nodes.forEach(function (node) {
        let nodeBtnGroup = nodeButton.append('g')
          .attr('id', 'out_circle' + node.uuid) // 为每一个节点定制一个按钮组，在画按钮组的时候为其指定该id
        let buttonEnter = nodeBtnGroup.selectAll('.buttonGroup') // nodeBtnGroup 刚创建
          .data(pieData)
          .enter()
          .append('g')
          .attr('class', function (d, i) {
            return 'action_' + i
          })
        let defaultR = 30
        if (typeof (node.r) === 'undefined') {
          node.r = defaultR
        }
        // 设置内径 和 外径
        let arc = d3.arc()
          .innerRadius(node.r)
          .outerRadius(node.r + node.r)
        buttonEnter.append('path')
          .attr('d', function (d) { // d 描述路径
            return arc(d)
          })
          .attr('fill', '#D2D5DA') // 描述扇区颜色
          .style('opacity', 0.6) // 扇区以及边界的透明度
          .attr('stroke', '#fff') // 边界颜色
          .attr('stroke-width', 1) // 边界宽度
        buttonEnter.append('text')
          .attr('transform', function (d, i) {
            return `translate(${arc.centroid(d)})`
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
    drawNode (node) {
      let _this = this
      node.selectAll('circle')
        .data(this.graph.nodes.map(d => Object.create(d)))
        .join('circle')
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
      }).call(d3.drag()
        .on('start', _this.dragStarted)
        .on('drag', _this.dragged)
        .on('end', _this.dragEnded))

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

      // 双击编辑结点属性
      nodeEnter.on('dblclick', function (event, d) { // d3 api 改了，多传了个 event 作为第一个参数
        _this.updateNodeProperty(d)
      })
      nodeEnter.on('mouseenter', function (d) {
        let aa = d3.select(this)._groups[0][0]
        if (aa.classList.contains('selected')) return
        d3.select(this)
          .transition()
          .style('stroke-width', '7')
      })
      nodeEnter.on('mouseleave', function (d) {
        let aa = d3.select(this)._groups[0][0]
        if (aa.classList.contains('selected')) return
        d3.select(this)
          .transition()
          .style('stroke-width', '2')
      })
      nodeEnter.on('click', function (event, d) {
        const thisCircle = _this.svg.select('.out_buttonGroup_' + d.uuid) // 此次点击的 node 元素
        // 若 btnGroup 已经打开，则关闭它
        if (!thisCircle._groups[0][0].classList.contains('circle_operate')) {
          thisCircle.classed('circle_operate', true)
            .transition()
            .style('opacity', 0)
            .on('end', function () {
              d3.select(this).style('display', 'none')
            })
          return
        }
        // 所有结点的外圈全部隐藏
        _this.svg.selectAll('.buttonGroup').classed('circle_operate', true)
          .transition()
          .style('opacity', 0)
          .on('end', function () {
            d3.select(this).style('display', 'none')
          })
        // 被点击结点的外圈打开
        thisCircle.classed('circle_operate', false)
          .style('display', 'block')
          .transition()
          .style('opacity', 1)
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
      // d.fixed = true
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
      _this.simulation.on('tick', () => {
        link
          // .attr('d', linkArc)
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        // 更新节点坐标
        nodes
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
      })
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
        link
          // .attr('d', linkArc)
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        // 更新节点坐标
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
        // 更新节点操作按钮组坐标
        nodeButton
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
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
    createSingleNode () {
      if (this.domain === null || this.domain === '') {
        alert('请先选择图谱')
        return
      }
      let _this = this
      let data = { name: '', r: 30, domain: _this.domain }
      $.ajax({
        data: data,
        type: 'POST',
        traditional: true,
        url: 'http://localhost:8081/create_node',
        success: function (result) {
          if (result.code === 200) {
            let newNode = result.data
            // 结点的坐标信息怎么来的？
            // newNode 格式：{"r":30,"color":"#483d8b","name":"","uuid":"83", "type": "未分类"}
            newNode.x = _this.txx
            newNode.y = _this.tyy
            newNode.fx = _this.txx
            newNode.fy = _this.tyy
            _this.graph.nodes.push(newNode)
            _this.updateGraph(true)
          }
        }
      })
    },
    /**
     * 修改结点属性，在双击结点时调用
     */
    updateNodeProperty (d) {
      this.switchIsEditingNodeAttr(true)
      this.setNodeAttr({
        name: d.name,
        r: d.r,
        color: d.color,
        type: d.type,
        url: d.url,
        fontSize: d.fontSize,
      })
    },
  }
}
</script>

<style>
#graphContainer {
  overflow: hidden;
  position: fixed;
  top: var(--nav-height);
  left: var(--toolbar-width);
  float: right;
  right: 0;
  bottom: 0;
}
circle {
  cursor: pointer;
}
</style>

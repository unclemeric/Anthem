import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {connect} from 'react-redux';

import {getScrollTop, getScrollHeight, getWindowHeight} from '@/app/tool/scrollSetBottom';

//redux 摄入摄出
import prop_dispatch from './index_prop_dispatch';
//基类
import BaseCom from '@/app/components/BaseComponent';
//机器人组件
import Robot from './Robot';

//获取文档总高度
let windowHeight = getWindowHeight;

/**
 * 容器组件
 */
const Container = styled.div `
    width: 100%;
    position: relative;
`;

class Anthem extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            positioningNum: 0
        }
    }
    componentDidMount() {
        //获取组件父级宽
        let anthemContainerWidth = ReactDOM
            .findDOMNode(this.refs.anthemContainer)
            .offsetWidth;

        //通过组件宽获取列宽
        this
            .props
            .setColumnsWidth(anthemContainerWidth);
        //获取可视区域高度
        this
            .props
            .setWindowHeight(document.documentElement.clientHeight);

        //获取left坐标
        this
            .props
            .setlocationLeft();

        //定位初始化top值
        this
            .props
            .setInitTop(this.props.maxcolumns);

        this
            .getNewImg()
            .then(() => {
                //滚动事件
                this.scrollAction();
            });

    }
    //随机id
    performanceId() {
        return performance
            .now()
            .toString()
            .substring(0, 6);
    }
    /**
     * 生成机器人id
     */
    generatorId(getInfo) {
        //没有给已知下标，则新建
        if (!getInfo.getNoShowRobotListNum && getInfo.getNoShowRobotListNum != 0) {
            return this.performanceId();
        }

        const getNoShowRobotListNum = getInfo
            .getNoShowRobotListNum
            .toString();

        const i = getInfo
            .i
            .toString();

        const domInfo = this
            .props
            .locationInfo
            .getIn([getNoShowRobotListNum, i]);

        return domInfo
            ? domInfo.robotid
            : this.performanceId();
    }

    //新资源
    getNewImg(getNoShowRobotListNum) {
        return this
            .props
            .getNewImgData(this.props.requestImgNum)
            .then(res => {

                for (let i = 0; i < res.data.length; i++) {

                    //获取机器人id
                    let robotId = this.generatorId({i, getNoShowRobotListNum});

                    let beyond = this.positioning(res.data[i], robotId);

                    if (beyond) {
                        break;
                    }

                }
            });
    }

    /**
     * 增加的时候开始 定位
     */
    positioning(element, robotId) {

        //屏幕总数
        let screenAllNum = this.props.screenAllNum;

        //定位与列数一直时 换行
        this.state.positioningNum == this.props.maxcolumns
            ? this.state.positioningNum = 0
            : null;

        //图片原始宽度
        const imgWidth = element.width;
        //列宽限定
        const columnsWidth = this.props.columnsWidth;

        //计算出图片在进入dom后的高度
        const imgHeight = (columnsWidth / imgWidth) * element.height;
        element.domHeight = imgHeight;

        //宽
        element.domWidth = columnsWidth;

        const robotTopLocation = this.props.robotTopLocation;
        //获取top数组中最小的座位下标
        const minTopNum = robotTopLocation.indexOf(Math.min.apply(Math, robotTopLocation));

        //获取top值
        element.top = robotTopLocation[minTopNum];

        //获取left值
        element.left = this.props.locationLeft[minTopNum];

        //位列一行中第几位
        element.columnsNum = minTopNum;

        //设定下一个同列图片的top
        this
            .props
            .setTop(minTopNum, imgHeight);

        const topNum = this.props.robotTopLocation[minTopNum];

        this
            .props
            .upContainerHeight(topNum);

        //获取所放置的屏幕号 下标
        let srceenIng = screenAllNum - 1;

        //创建
        this
            .props
            .addlocationInfo(element, robotId, srceenIng);

        //增长
        this.state.positioningNum++;

        //top大于当前屏幕高度 则增加屏幕
        if (element.top > (this.props.windowViewHeight * screenAllNum)) {

            //超出高度 则不管了
            return 'beyond';

        }

    }

    scrollAction() {
        window.onscroll = () => {
            const scrollTop = getScrollTop() + windowHeight;

            let screenNumIng = (Math.floor(scrollTop / windowHeight)) - 1;

            if (screenNumIng !== this.props.numIng) {
                this.changeScreen(screenNumIng);
            }

            /**
             * 到底部
             * 获取新的图片资源
             */
            if (scrollTop === getScrollHeight()) {
                //增加下一个屏幕的元素队列
                this
                    .props
                    .addlocationInfoNum(this.props.screenAllNum);

                //增加屏幕
                this
                    .props
                    .addScreen();

                //增加当前加载的屏幕队
                this
                    .props
                    .addloadingScreen(this.props.screenAllNum);

                //获取未显示的机器人屏幕下标
                const getNoShowRobotListNum = this.props.screenAllNum - 4;

                this.getNewImg((getNoShowRobotListNum < 1
                    ? undefined
                    //传入下标
                    : (getNoShowRobotListNum - 1)));

            }
        };
    }
    //显示屏幕号 转换
    changeScreen(screenNumIng) {
        //更换上一个旧屏幕下标
        this
            .props
            .changeOldNum(this.props.numIng);

        //更换当前屏幕下标
        this
            .props
            .changeScreen(screenNumIng);

        if (screenNumIng > this.props.oldNum) {
            //向下滑动
            const newShowScreenNum = screenNumIng + 2;
            (this.props.loadingScreen.indexOf(screenNumIng) === 2 && this.props.locationInfo.getIn([newShowScreenNum.toString()]))
                ? this
                    .props
                    .downChange(newShowScreenNum)
                : null;

        } else if (screenNumIng < this.props.oldNum) {

            //向上滑动
            const newShowScreenNum = screenNumIng - 2;

            (this.props.loadingScreen.indexOf(screenNumIng) === 1 && newShowScreenNum >= 0)
                ? this
                    .props
                    .upChange(newShowScreenNum)
                : null;
        }
    }

    render() {
        const allRobot = this
            .props
            .renderRobot
            .map(robot => {
                return (<Robot key={robot.robotid} info={robot}/>);
            });
        return (
            <Container
                ref="anthemContainer"
                style={{
                height: this.props.containerHeight
            }}>
                {allRobot}
            </Container>
        );
    }
}

export default connect(prop_dispatch.stateSetProp, prop_dispatch.dispatchToProps)(Anthem);
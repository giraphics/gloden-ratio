import BaseShape from './baseshape';
import {PRIMITIVE_TYPE} from './../renderer/constants';

export default class SceneGraph extends BaseShape {
    constructor(primitiveType: PRIMITIVE_TYPE) {
        super(primitiveType);
    }
}
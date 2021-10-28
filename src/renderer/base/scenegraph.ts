import BaseShape from './baseshape';
import {PRIMITIVE_TYPE, TYPE_SIZE} from './../renderer/constants';

export default class SceneGraph extends BaseShape {
    constructor(primitiveType: PRIMITIVE_TYPE, typeSize?: TYPE_SIZE[]) {
        super(primitiveType, typeSize);
    }
}
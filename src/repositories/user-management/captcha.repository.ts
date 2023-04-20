import {BaseLocalRepository} from '../../repositories';
import {juggler} from '@loopback/repository';
import {Captcha, CaptchaRelations} from '../../models';

export class CaptchaRepository extends BaseLocalRepository<Captcha, typeof Captcha.prototype.id, CaptchaRelations> {
  constructor(dataSource: juggler.DataSource) {
    super(Captcha, dataSource);
  }
}

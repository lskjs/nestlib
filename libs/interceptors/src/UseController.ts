// import { Controller } from '@nestjs/common';

// export const UseController = (path: string) => (target: any) => {
//   target.prototype.path = path;
//   return Controller(path)(target);
// };

// // export const UseControllerAndInterceptors = (path: string, interceptors: any[]) => (target: any) => {

// //   target.prototype.path = path;
// //   return Controller(path)(target);
// // };

// // = (path: string) => {
// //     return (target: any) => {
// //         target.prototype.path = path;
// //         return Controller(path)(target);
// //     };
// //     }
// // @Controller('api/list')
// // @UseInterceptors(new ResponseInterceptor(), new ErrorInterceptor())
